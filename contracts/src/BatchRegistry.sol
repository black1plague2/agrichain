// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

/// @notice Batch lifecycle ledger. Farmers register through the trusted forwarder (gasless);
/// logistics and escrow move state directly with their own wallets.
contract BatchRegistry is AccessControl, ERC2771Context {
    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE");
    bytes32 public constant ESCROW_ROLE = keccak256("ESCROW_ROLE");

    enum Status {
        REGISTERED,
        IN_TRANSIT,
        DELIVERED,
        RESOLVED
    }

    struct Batch {
        address farmer;
        string crop;
        uint256 quantityKg;
        string geohash;
        string ipfsPhotoHash;
        Status status;
        uint8 qualityGrade;
        uint256 registeredAt;
    }

    uint256 private _nextBatchId = 1;
    mapping(uint256 => Batch) private _batches;

    event BatchRegistered(
        uint256 indexed batchId, address indexed farmer, string crop, uint256 quantityKg
    );
    event BatchStateChanged(uint256 indexed batchId, Status from, Status to);

    error BatchNotFound(uint256 batchId);
    error InvalidStateTransition(uint256 batchId, Status from, Status to);
    error EmptyQuantity();

    constructor(address admin, address trustedForwarder)
        ERC2771Context(trustedForwarder)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function registerBatch(
        string calldata crop,
        uint256 quantityKg,
        string calldata geohash,
        string calldata ipfsPhotoHash
    ) external returns (uint256 batchId) {
        if (quantityKg == 0) revert EmptyQuantity();

        batchId = _nextBatchId++;
        _batches[batchId] = Batch({
            farmer: _msgSender(),
            crop: crop,
            quantityKg: quantityKg,
            geohash: geohash,
            ipfsPhotoHash: ipfsPhotoHash,
            status: Status.REGISTERED,
            qualityGrade: 0,
            registeredAt: block.timestamp
        });

        emit BatchRegistered(batchId, _msgSender(), crop, quantityKg);
        emit BatchStateChanged(batchId, Status.REGISTERED, Status.REGISTERED);
    }

    function markInTransit(uint256 batchId) external onlyRole(LOGISTICS_ROLE) {
        Batch storage batch = _getBatch(batchId);
        if (batch.status != Status.REGISTERED) {
            revert InvalidStateTransition(batchId, batch.status, Status.IN_TRANSIT);
        }
        batch.status = Status.IN_TRANSIT;
        emit BatchStateChanged(batchId, Status.REGISTERED, Status.IN_TRANSIT);
    }

    function markDelivered(uint256 batchId, uint8 qualityGrade)
        external
        onlyRole(LOGISTICS_ROLE)
    {
        Batch storage batch = _getBatch(batchId);
        if (batch.status != Status.IN_TRANSIT) {
            revert InvalidStateTransition(batchId, batch.status, Status.DELIVERED);
        }
        batch.status = Status.DELIVERED;
        batch.qualityGrade = qualityGrade;
        emit BatchStateChanged(batchId, Status.IN_TRANSIT, Status.DELIVERED);
    }

    /// @notice Called by the Escrow contract once settlement completes.
    function markResolved(uint256 batchId) external onlyRole(ESCROW_ROLE) {
        Batch storage batch = _getBatch(batchId);
        if (batch.status != Status.DELIVERED) {
            revert InvalidStateTransition(batchId, batch.status, Status.RESOLVED);
        }
        batch.status = Status.RESOLVED;
        emit BatchStateChanged(batchId, Status.DELIVERED, Status.RESOLVED);
    }

    function getBatch(uint256 batchId) external view returns (Batch memory) {
        return _getBatch(batchId);
    }

    function _getBatch(uint256 batchId) private view returns (Batch storage batch) {
        batch = _batches[batchId];
        if (batch.registeredAt == 0) revert BatchNotFound(batchId);
    }

    // --- ERC2771Context / Context resolution ---

    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength()
        internal
        view
        override(Context, ERC2771Context)
        returns (uint256)
    {
        return ERC2771Context._contextSuffixLength();
    }
}
