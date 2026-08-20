// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Helpers} from "./Helpers.t.sol";
import {WeighbridgeRegistry} from "../src/WeighbridgeRegistry.sol";

contract WeighbridgeRegistryTest is Helpers {
    function setUp() public {
        _deployCore();
    }

    function test_assignDevice_onlyLogisticsRole() public {
        uint256 batchId = _registerBatch(1000);

        vm.expectRevert();
        weighbridge.assignDevice(batchId, device, "Model-X", "SN-001");

        _assignDevice(batchId);
        (address assigned, bool isAssigned) = weighbridge.getAssignedDevice(batchId);
        assertEq(assigned, device);
        assertTrue(isAssigned);
    }

    function test_assignDevice_revertsIfAlreadyAssigned() public {
        uint256 batchId = _registerBatch(1000);
        _assignDevice(batchId);

        vm.prank(logistics);
        vm.expectRevert(abi.encodeWithSelector(WeighbridgeRegistry.AlreadyAssigned.selector, batchId));
        weighbridge.assignDevice(batchId, device, "Model-X", "SN-001");
    }

    function test_recordVerifiedWeight_acceptsValidSignature() public {
        uint256 batchId = _registerBatch(1000);
        _assignDevice(batchId);

        _recordWeight(batchId, 950, 1);

        (uint256 weightKg, bool recorded) = weighbridge.getVerifiedWeight(batchId);
        assertEq(weightKg, 950);
        assertTrue(recorded);
    }

    function test_recordVerifiedWeight_revertsWithNoDeviceAssigned() public {
        uint256 batchId = _registerBatch(1000);

        bytes memory sig = _signWeight(batchId, 950, 1);
        vm.expectRevert(abi.encodeWithSelector(WeighbridgeRegistry.NoDeviceAssigned.selector, batchId));
        weighbridge.recordVerifiedWeight(batchId, 950, sig, 1);
    }

    /// @dev The core trust claim: only the assigned device's own key can produce a valid
    /// reading. A different key (e.g. a compromised app backend) cannot forge one.
    function test_recordVerifiedWeight_revertsOnWrongSigningKey() public {
        uint256 batchId = _registerBatch(1000);
        _assignDevice(batchId);

        uint256 attackerKey = 0xBAD;
        bytes32 messageHash = keccak256(abi.encodePacked(address(weighbridge), block.chainid, batchId, uint256(950), uint256(1)));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(attackerKey, ethSignedHash);
        bytes memory forgedSig = abi.encodePacked(r, s, v);

        vm.expectRevert(WeighbridgeRegistry.InvalidSignature.selector);
        weighbridge.recordVerifiedWeight(batchId, 950, forgedSig, 1);
    }

    function test_recordVerifiedWeight_revertsOnNonceReplay() public {
        uint256 batchId1 = _registerBatch(1000);
        uint256 batchId2 = _registerBatch(1000);
        _assignDevice(batchId1);
        vm.prank(logistics);
        weighbridge.assignDevice(batchId2, device, "Model-X", "SN-002");

        _recordWeight(batchId1, 950, 1);

        // Same device, same nonce, different batch — must still be rejected as replay.
        bytes memory sig = _signWeight(batchId2, 950, 1);
        vm.expectRevert(abi.encodeWithSelector(WeighbridgeRegistry.NonceAlreadyUsed.selector, device, uint256(1)));
        weighbridge.recordVerifiedWeight(batchId2, 950, sig, 1);
    }

    function test_recordVerifiedWeight_revertsIfAlreadyRecorded() public {
        uint256 batchId = _registerBatch(1000);
        _assignDevice(batchId);
        _recordWeight(batchId, 950, 1);

        bytes memory sig = _signWeight(batchId, 960, 2);
        vm.expectRevert(abi.encodeWithSelector(WeighbridgeRegistry.AlreadyRecorded.selector, batchId));
        weighbridge.recordVerifiedWeight(batchId, 960, sig, 2);
    }
}
