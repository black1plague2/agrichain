// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Helpers} from "./Helpers.t.sol";
import {BatchRegistry} from "../src/BatchRegistry.sol";

contract BatchRegistryTest is Helpers {
    function setUp() public {
        _deployCore();
    }

    function test_registerBatch_setsFarmerAsSender() public {
        uint256 batchId = _registerBatch(1000);
        BatchRegistry.Batch memory batch = batchRegistry.getBatch(batchId);

        assertEq(batch.farmer, farmer);
        assertEq(batch.quantityKg, 1000);
        assertEq(uint8(batch.status), uint8(BatchRegistry.Status.REGISTERED));
    }

    function test_registerBatch_revertsOnZeroQuantity() public {
        vm.prank(farmer);
        vm.expectRevert(BatchRegistry.EmptyQuantity.selector);
        batchRegistry.registerBatch("wheat", 0, "geohash", "cid");
    }

    function test_lifecycle_happyPath() public {
        uint256 batchId = _registerBatch(1000);

        vm.startPrank(logistics);
        batchRegistry.markInTransit(batchId);
        assertEq(uint8(batchRegistry.getBatch(batchId).status), uint8(BatchRegistry.Status.IN_TRANSIT));

        batchRegistry.markDelivered(batchId, 88);
        BatchRegistry.Batch memory batch = batchRegistry.getBatch(batchId);
        assertEq(uint8(batch.status), uint8(BatchRegistry.Status.DELIVERED));
        assertEq(batch.qualityGrade, 88);
        vm.stopPrank();
    }

    function test_markInTransit_revertsWithoutLogisticsRole() public {
        uint256 batchId = _registerBatch(1000);

        vm.expectRevert();
        batchRegistry.markInTransit(batchId);
    }

    function test_markInTransit_revertsOnInvalidTransition() public {
        uint256 batchId = _registerBatch(1000);

        vm.startPrank(logistics);
        batchRegistry.markInTransit(batchId);
        vm.expectRevert(
            abi.encodeWithSelector(
                BatchRegistry.InvalidStateTransition.selector,
                batchId,
                BatchRegistry.Status.IN_TRANSIT,
                BatchRegistry.Status.IN_TRANSIT
            )
        );
        batchRegistry.markInTransit(batchId);
        vm.stopPrank();
    }

    function test_markResolved_onlyEscrowRole() public {
        uint256 batchId = _registerBatch(1000);
        vm.startPrank(logistics);
        batchRegistry.markInTransit(batchId);
        batchRegistry.markDelivered(batchId, 90);
        vm.stopPrank();

        vm.expectRevert();
        batchRegistry.markResolved(batchId);

        vm.prank(address(escrow));
        batchRegistry.markResolved(batchId);
        assertEq(uint8(batchRegistry.getBatch(batchId).status), uint8(BatchRegistry.Status.RESOLVED));
    }

    function test_getBatch_revertsForUnknownBatch() public {
        vm.expectRevert(abi.encodeWithSelector(BatchRegistry.BatchNotFound.selector, uint256(999)));
        batchRegistry.getBatch(999);
    }
}
