// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @notice Ties a weighbridge device's own signing key to a batch, and verifies its reading
/// on-chain. This is what makes "weight can't be faked" real instead of a slogan: the app
/// backend never holds the device key, so a compromised app server cannot forge a reading
/// (see PLAN.md threat model L3).
contract WeighbridgeRegistry is AccessControl {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE");

    struct Device {
        address deviceAddress;
        string model;
        string serial;
        bool assigned;
    }

    struct VerifiedWeight {
        uint256 weightKg;
        uint256 recordedAt;
        bool recorded;
    }

    mapping(uint256 => Device) private _assignedDevice; // batchId => device
    mapping(uint256 => VerifiedWeight) private _verifiedWeight; // batchId => reading
    mapping(address => mapping(uint256 => bool)) private _usedNonce; // device => nonce => used

    event DeviceAssigned(uint256 indexed batchId, address indexed deviceAddress, string model, string serial);
    event WeightVerified(uint256 indexed batchId, uint256 weightKg, address indexed deviceAddress);

    error NoDeviceAssigned(uint256 batchId);
    error AlreadyAssigned(uint256 batchId);
    error NonceAlreadyUsed(address device, uint256 nonce);
    error InvalidSignature();
    error AlreadyRecorded(uint256 batchId);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function assignDevice(uint256 batchId, address deviceAddress, string calldata model, string calldata serial)
        external
        onlyRole(LOGISTICS_ROLE)
    {
        if (_assignedDevice[batchId].assigned) revert AlreadyAssigned(batchId);
        _assignedDevice[batchId] =
            Device({deviceAddress: deviceAddress, model: model, serial: serial, assigned: true});
        emit DeviceAssigned(batchId, deviceAddress, model, serial);
    }

    /// @param deviceSig ECDSA signature over keccak256(address(this), chainid, batchId, weightKg, readingNonce),
    /// produced by the device's own private key — never held by the app backend.
    function recordVerifiedWeight(uint256 batchId, uint256 weightKg, bytes calldata deviceSig, uint256 readingNonce)
        external
    {
        Device memory device = _assignedDevice[batchId];
        if (!device.assigned) revert NoDeviceAssigned(batchId);
        if (_verifiedWeight[batchId].recorded) revert AlreadyRecorded(batchId);
        if (_usedNonce[device.deviceAddress][readingNonce]) {
            revert NonceAlreadyUsed(device.deviceAddress, readingNonce);
        }

        bytes32 messageHash =
            keccak256(abi.encodePacked(address(this), block.chainid, batchId, weightKg, readingNonce));
        address recovered = messageHash.toEthSignedMessageHash().recover(deviceSig);
        if (recovered != device.deviceAddress) revert InvalidSignature();

        _usedNonce[device.deviceAddress][readingNonce] = true;
        _verifiedWeight[batchId] = VerifiedWeight({weightKg: weightKg, recordedAt: block.timestamp, recorded: true});

        emit WeightVerified(batchId, weightKg, device.deviceAddress);
    }

    function getVerifiedWeight(uint256 batchId) external view returns (uint256 weightKg, bool recorded) {
        VerifiedWeight memory reading = _verifiedWeight[batchId];
        return (reading.weightKg, reading.recorded);
    }

    function getAssignedDevice(uint256 batchId) external view returns (address deviceAddress, bool assigned) {
        Device memory device = _assignedDevice[batchId];
        return (device.deviceAddress, device.assigned);
    }
}
