// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {BatchRegistry} from "./BatchRegistry.sol";
import {FairPriceOracle} from "./FairPriceOracle.sol";
import {WeighbridgeRegistry} from "./WeighbridgeRegistry.sol";

/// @notice Holds buyer funds against a batch and releases them on a signed weighbridge reading.
///
/// Two fixes versus the original design (see PLAN.md threat model L1/L2):
///   1. Price is snapshotted from the oracle AT OPEN, never re-read at settlement — an admin
///      moving the oracle price after escrow opens cannot change what's owed.
///   2. Farmer is paid for the VERIFIED weight, not the registered quantity — over-registering
///      a batch is no longer a free payout.
///
/// Simplification versus PLAN.md's "logistics collateral" language: this MVP has no separate
/// collateral-bonding contract for logistics. The penalty for underweight delivery is that the
/// buyer is refunded the shortfall rather than paying for goods that were never delivered, and
/// logistics/farmer receive nothing for the undelivered portion. A dedicated logistics bond is
/// noted as future work, not built here — documented rather than silently dropped.
contract Escrow is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ESCROW_OPERATOR_ROLE = keccak256("ESCROW_OPERATOR_ROLE");
    uint256 public constant DEVIATION_THRESHOLD_BPS = 500; // 5%
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant MAX_PRICE_AGE_SECONDS = 24 hours;

    struct EscrowData {
        address buyer;
        uint256 snapshotPrice;
        uint256 quantityKg;
        uint256 depositAmount;
        uint256 openedAt;
        uint256 timeoutSeconds;
        bool settled;
        bool refunded;
        bool disputed;
    }

    BatchRegistry public immutable batchRegistry;
    FairPriceOracle public immutable priceOracle;
    WeighbridgeRegistry public immutable weighbridge;
    IERC20 public immutable agriToken;

    /// @dev Default timeout applied to newly-opened escrows. Set this to a short value (e.g.
    /// 60 seconds) before a live demo so the timeout-refund failure path is actually stageable;
    /// production deploys should set this to 7 days. Existing open escrows keep the timeout
    /// they were opened with even if this default changes later.
    uint256 public defaultTimeoutSeconds = 7 days;

    mapping(uint256 => EscrowData) private _escrows;
    mapping(address => uint256) private _pendingWithdrawals;

    event EscrowOpened(uint256 indexed batchId, address indexed buyer, uint256 snapshotPrice, uint256 depositAmount);
    event EscrowSettled(uint256 indexed batchId, uint256 verifiedWeightKg, uint256 farmerPayout, uint256 buyerRefund);
    event PenaltyApplied(uint256 indexed batchId, uint256 deviationBps);
    event EscrowRefundedOnTimeout(uint256 indexed batchId, uint256 amount);
    event DisputeFlagged(uint256 indexed batchId);
    event DisputeResolved(uint256 indexed batchId);
    event Withdrawn(address indexed account, uint256 amount);
    event DefaultTimeoutUpdated(uint256 newTimeoutSeconds);

    error BatchNotRegistered(uint256 batchId);
    error EscrowAlreadyOpen(uint256 batchId);
    error EscrowNotOpen(uint256 batchId);
    error StalePrice(uint256 ageSeconds);
    error PriceMismatch(uint256 provided, uint256 current);
    error NoVerifiedWeight(uint256 batchId);
    error AlreadySettled(uint256 batchId);
    error AlreadyRefunded(uint256 batchId);
    error TimeoutNotReached(uint256 batchId, uint256 readyAt);
    error EscrowIsDisputed(uint256 batchId);
    error EscrowNotDisputed(uint256 batchId);
    error NothingToWithdraw();

    constructor(
        address admin,
        BatchRegistry batchRegistry_,
        FairPriceOracle priceOracle_,
        WeighbridgeRegistry weighbridge_,
        IERC20 agriToken_
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        batchRegistry = batchRegistry_;
        priceOracle = priceOracle_;
        weighbridge = weighbridge_;
        agriToken = agriToken_;
    }

    function setDefaultTimeoutSeconds(uint256 newTimeoutSeconds) external onlyRole(DEFAULT_ADMIN_ROLE) {
        defaultTimeoutSeconds = newTimeoutSeconds;
        emit DefaultTimeoutUpdated(newTimeoutSeconds);
    }

    /// @notice Buyer opens escrow against a registered batch. `expectedPrice` must equal the
    /// oracle's current price for the batch's crop — this is not a price the buyer picks, it's
    /// a confirmation of what they read, snapshotted here so it can never move again for this sale.
    function openEscrow(uint256 batchId, uint256 expectedPrice) external nonReentrant {
        if (_escrows[batchId].buyer != address(0)) revert EscrowAlreadyOpen(batchId);

        BatchRegistry.Batch memory batch = batchRegistry.getBatch(batchId);
        if (batch.status != BatchRegistry.Status.REGISTERED) revert BatchNotRegistered(batchId);

        (uint256 currentPrice, uint256 age) = priceOracle.getPrice(batch.crop);
        if (age > MAX_PRICE_AGE_SECONDS) revert StalePrice(age);
        if (currentPrice != expectedPrice) revert PriceMismatch(expectedPrice, currentPrice);

        uint256 depositAmount = batch.quantityKg * currentPrice;

        _escrows[batchId] = EscrowData({
            buyer: msg.sender,
            snapshotPrice: currentPrice,
            quantityKg: batch.quantityKg,
            depositAmount: depositAmount,
            openedAt: block.timestamp,
            timeoutSeconds: defaultTimeoutSeconds,
            settled: false,
            refunded: false,
            disputed: false
        });

        emit EscrowOpened(batchId, msg.sender, currentPrice, depositAmount);

        agriToken.safeTransferFrom(msg.sender, address(this), depositAmount);
    }

    /// @notice Permissionless: anyone can trigger settlement once a signed weight is recorded.
    function settle(uint256 batchId) external nonReentrant {
        EscrowData storage escrowData = _escrows[batchId];
        if (escrowData.buyer == address(0)) revert EscrowNotOpen(batchId);
        if (escrowData.settled) revert AlreadySettled(batchId);
        if (escrowData.refunded) revert AlreadyRefunded(batchId);
        if (escrowData.disputed) revert EscrowIsDisputed(batchId);

        (uint256 verifiedWeightKg, bool recorded) = weighbridge.getVerifiedWeight(batchId);
        if (!recorded) revert NoVerifiedWeight(batchId);

        uint256 payableWeight = verifiedWeightKg > escrowData.quantityKg ? escrowData.quantityKg : verifiedWeightKg;
        uint256 farmerPayout = payableWeight * escrowData.snapshotPrice;
        uint256 buyerRefund = escrowData.depositAmount - farmerPayout;

        uint256 deviation = verifiedWeightKg > escrowData.quantityKg
            ? verifiedWeightKg - escrowData.quantityKg
            : escrowData.quantityKg - verifiedWeightKg;
        uint256 deviationBps = deviation * BPS_DENOMINATOR / escrowData.quantityKg;

        escrowData.settled = true;

        BatchRegistry.Batch memory batch = batchRegistry.getBatch(batchId);
        _pendingWithdrawals[batch.farmer] += farmerPayout;
        if (buyerRefund > 0) {
            _pendingWithdrawals[escrowData.buyer] += buyerRefund;
        }

        emit EscrowSettled(batchId, verifiedWeightKg, farmerPayout, buyerRefund);
        if (deviationBps > DEVIATION_THRESHOLD_BPS) {
            emit PenaltyApplied(batchId, deviationBps);
        }

        batchRegistry.markResolved(batchId);
    }

    /// @notice Buyer (or anyone, on the buyer's behalf) reclaims the deposit if no verified
    /// weight ever arrives within the escrow's timeout window.
    function refundOnTimeout(uint256 batchId) external nonReentrant {
        EscrowData storage escrowData = _escrows[batchId];
        if (escrowData.buyer == address(0)) revert EscrowNotOpen(batchId);
        if (escrowData.settled) revert AlreadySettled(batchId);
        if (escrowData.refunded) revert AlreadyRefunded(batchId);
        if (escrowData.disputed) revert EscrowIsDisputed(batchId);

        uint256 readyAt = escrowData.openedAt + escrowData.timeoutSeconds;
        if (block.timestamp < readyAt) revert TimeoutNotReached(batchId, readyAt);

        escrowData.refunded = true;
        _pendingWithdrawals[escrowData.buyer] += escrowData.depositAmount;

        emit EscrowRefundedOnTimeout(batchId, escrowData.depositAmount);
    }

    function flagDispute(uint256 batchId) external onlyRole(ESCROW_OPERATOR_ROLE) {
        EscrowData storage escrowData = _escrows[batchId];
        if (escrowData.buyer == address(0)) revert EscrowNotOpen(batchId);
        escrowData.disputed = true;
        emit DisputeFlagged(batchId);
    }

    /// @dev Single-admin dispute resolution is accepted for the demo and documented in
    /// PLAN.md threat model L11. Production path: two-of-three signers or a timelock.
    function resolveDispute(uint256 batchId) external onlyRole(ESCROW_OPERATOR_ROLE) {
        EscrowData storage escrowData = _escrows[batchId];
        if (!escrowData.disputed) revert EscrowNotDisputed(batchId);
        escrowData.disputed = false;
        emit DisputeResolved(batchId);
    }

    function withdraw() external nonReentrant {
        uint256 amount = _pendingWithdrawals[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        _pendingWithdrawals[msg.sender] = 0;
        emit Withdrawn(msg.sender, amount);

        agriToken.safeTransfer(msg.sender, amount);
    }

    function pendingWithdrawal(address account) external view returns (uint256) {
        return _pendingWithdrawals[account];
    }

    function getEscrow(uint256 batchId) external view returns (EscrowData memory) {
        return _escrows[batchId];
    }
}
