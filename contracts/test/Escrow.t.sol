// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";
import {Helpers} from "./Helpers.t.sol";
import {Escrow} from "../src/Escrow.sol";
import {BatchRegistry} from "../src/BatchRegistry.sol";
import {FairPriceOracle} from "../src/FairPriceOracle.sol";

contract EscrowTest is Helpers {
    uint256 internal constant PRICE_PER_KG = 30 ether; // 30 AGRI/kg
    uint256 internal constant QUANTITY_KG = 1000;
    uint256 internal constant DEPOSIT = PRICE_PER_KG * QUANTITY_KG;

    function setUp() public {
        _deployCore();
    }

    function _openStandardEscrow() internal returns (uint256 batchId) {
        batchId = _registerBatch(QUANTITY_KG);
        _setPrice(PRICE_PER_KG);
        _openEscrow(batchId, PRICE_PER_KG, DEPOSIT);
    }

    function test_openEscrow_transfersExactDeposit() public {
        uint256 batchId = _openStandardEscrow();
        assertEq(agriToken.balanceOf(address(escrow)), DEPOSIT);

        Escrow.EscrowData memory data = escrow.getEscrow(batchId);
        assertEq(data.snapshotPrice, PRICE_PER_KG);
        assertEq(data.depositAmount, DEPOSIT);
        assertEq(data.buyer, buyer);
    }

    function test_openEscrow_revertsOnPriceMismatch() public {
        uint256 batchId = _registerBatch(QUANTITY_KG);
        _setPrice(PRICE_PER_KG);

        vm.startPrank(buyer);
        agriToken.approve(address(escrow), DEPOSIT);
        vm.expectRevert(abi.encodeWithSelector(Escrow.PriceMismatch.selector, PRICE_PER_KG - 1, PRICE_PER_KG));
        escrow.openEscrow(batchId, PRICE_PER_KG - 1);
        vm.stopPrank();
    }

    function test_openEscrow_revertsOnStalePrice() public {
        uint256 batchId = _registerBatch(QUANTITY_KG);
        _setPrice(PRICE_PER_KG);
        vm.warp(block.timestamp + 25 hours);

        vm.startPrank(buyer);
        agriToken.approve(address(escrow), DEPOSIT);
        vm.expectRevert();
        escrow.openEscrow(batchId, PRICE_PER_KG);
        vm.stopPrank();
    }

    /// @dev Regression test for the fixed exploit: moving the oracle price after escrow opens
    /// must not change what's owed at settlement.
    function test_settle_priceCannotMoveAfterOpen() public {
        uint256 batchId = _openStandardEscrow();
        _deliverBatch(batchId);
        _assignDevice(batchId);

        // Admin/feed moves the price up sharply after escrow already opened.
        _setPrice(PRICE_PER_KG * 3);

        _recordWeight(batchId, QUANTITY_KG, 1);
        escrow.settle(batchId);

        // Farmer is paid at the ORIGINAL snapshot price, not the manipulated live price.
        assertEq(escrow.pendingWithdrawal(farmer), QUANTITY_KG * PRICE_PER_KG);
    }

    function test_settle_exactWeight_paysFarmerFullDeposit() public {
        uint256 batchId = _openStandardEscrow();
        _deliverBatch(batchId);
        _assignDevice(batchId);
        _recordWeight(batchId, QUANTITY_KG, 1);

        escrow.settle(batchId);

        assertEq(escrow.pendingWithdrawal(farmer), DEPOSIT);
        assertEq(escrow.pendingWithdrawal(buyer), 0);

        BatchRegistry.Batch memory batch = batchRegistry.getBatch(batchId);
        assertEq(uint8(batch.status), uint8(BatchRegistry.Status.RESOLVED));
    }

    /// @dev Regression test for the fixed exploit: farmer must be paid for delivered weight,
    /// not the registered quantity. Over-registration must not be a free payout.
    function test_settle_underweight_paysOnlyForDeliveredWeight() public {
        uint256 batchId = _openStandardEscrow();
        _deliverBatch(batchId);
        _assignDevice(batchId);

        uint256 deliveredKg = 700; // 30% short — above the 5% deviation threshold
        _recordWeight(batchId, deliveredKg, 1);
        escrow.settle(batchId);

        uint256 expectedFarmerPayout = deliveredKg * PRICE_PER_KG;
        uint256 expectedBuyerRefund = DEPOSIT - expectedFarmerPayout;

        assertEq(escrow.pendingWithdrawal(farmer), expectedFarmerPayout);
        assertEq(escrow.pendingWithdrawal(buyer), expectedBuyerRefund);
    }

    function test_settle_smallDeviation_noPenaltyEvent() public {
        uint256 batchId = _openStandardEscrow();
        _deliverBatch(batchId);
        _assignDevice(batchId);

        uint256 deliveredKg = 980; // 2% short — under the 5% threshold
        _recordWeight(batchId, deliveredKg, 1);

        vm.recordLogs();
        escrow.settle(batchId);

        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 penaltyTopic = keccak256("PenaltyApplied(uint256,uint256)");
        for (uint256 i = 0; i < logs.length; i++) {
            assertTrue(logs[i].topics[0] != penaltyTopic, "PenaltyApplied must not fire under threshold");
        }
    }

    function test_settle_largeDeviation_emitsPenaltyEvent() public {
        uint256 batchId = _openStandardEscrow();
        _deliverBatch(batchId);
        _assignDevice(batchId);

        uint256 deliveredKg = 700; // 30% short — above the 5% threshold
        _recordWeight(batchId, deliveredKg, 1);

        vm.recordLogs();
        escrow.settle(batchId);

        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 penaltyTopic = keccak256("PenaltyApplied(uint256,uint256)");
        bool found = false;
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].topics[0] == penaltyTopic) found = true;
        }
        assertTrue(found, "PenaltyApplied must fire above threshold");
    }

    function test_settle_overDelivery_cappedAtRegisteredQuantity() public {
        uint256 batchId = _openStandardEscrow();
        _deliverBatch(batchId);
        _assignDevice(batchId);

        uint256 deliveredKg = 1200; // over-delivery
        _recordWeight(batchId, deliveredKg, 1);
        escrow.settle(batchId);

        // Farmer is capped at the deposit's worth (registered quantity), no more.
        assertEq(escrow.pendingWithdrawal(farmer), DEPOSIT);
        assertEq(escrow.pendingWithdrawal(buyer), 0);
    }

    function test_settle_revertsWithoutVerifiedWeight() public {
        uint256 batchId = _openStandardEscrow();
        _deliverBatch(batchId);

        vm.expectRevert(abi.encodeWithSelector(Escrow.NoVerifiedWeight.selector, batchId));
        escrow.settle(batchId);
    }

    function test_settle_revertsIfDisputed() public {
        uint256 batchId = _openStandardEscrow();
        _deliverBatch(batchId);
        _assignDevice(batchId);
        _recordWeight(batchId, QUANTITY_KG, 1);

        vm.prank(admin);
        escrow.flagDispute(batchId);

        vm.expectRevert(abi.encodeWithSelector(Escrow.EscrowIsDisputed.selector, batchId));
        escrow.settle(batchId);
    }

    function test_refundOnTimeout_demoModeShortTimeout() public {
        vm.prank(admin);
        escrow.setDefaultTimeoutSeconds(60); // demo-mode: 60 seconds instead of 7 days

        uint256 batchId = _openStandardEscrow();

        vm.expectRevert();
        escrow.refundOnTimeout(batchId);

        vm.warp(block.timestamp + 61);
        escrow.refundOnTimeout(batchId);

        assertEq(escrow.pendingWithdrawal(buyer), DEPOSIT);
    }

    function test_withdraw_pullPayment() public {
        uint256 batchId = _openStandardEscrow();
        _deliverBatch(batchId);
        _assignDevice(batchId);
        _recordWeight(batchId, QUANTITY_KG, 1);
        escrow.settle(batchId);

        uint256 farmerBalanceBefore = agriToken.balanceOf(farmer);
        vm.prank(farmer);
        escrow.withdraw();

        assertEq(agriToken.balanceOf(farmer), farmerBalanceBefore + DEPOSIT);
        assertEq(escrow.pendingWithdrawal(farmer), 0);
    }

    function test_withdraw_revertsWithNothingPending() public {
        vm.expectRevert(Escrow.NothingToWithdraw.selector);
        vm.prank(farmer);
        escrow.withdraw();
    }

    function _assertNoPenaltyEvent() internal {
        // If settle() succeeded above without reverting, and DEVIATION_THRESHOLD_BPS logic is
        // correct, no PenaltyApplied event is emitted. Absence is checked implicitly by the
        // deviation math tested in test_settle_underweight_paysOnlyForDeliveredWeight; this
        // test exists to document the boundary case explicitly.
    }
}
