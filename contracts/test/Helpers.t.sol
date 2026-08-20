// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {AgriToken} from "../src/AgriToken.sol";
import {BatchRegistry} from "../src/BatchRegistry.sol";
import {FairPriceOracle} from "../src/FairPriceOracle.sol";
import {WeighbridgeRegistry} from "../src/WeighbridgeRegistry.sol";
import {Escrow} from "../src/Escrow.sol";
import {Forwarder} from "../src/Forwarder.sol";

/// @notice Shared deployment + fixture setup for all contract test suites.
abstract contract Helpers is Test {
    address internal admin = makeAddr("admin");
    address internal farmer = makeAddr("farmer");
    address internal buyer = makeAddr("buyer");
    address internal logistics = makeAddr("logistics");
    address internal feed = makeAddr("feed");

    uint256 internal devicePrivateKey = 0xBEEF;
    address internal device;

    AgriToken internal agriToken;
    BatchRegistry internal batchRegistry;
    FairPriceOracle internal priceOracle;
    WeighbridgeRegistry internal weighbridge;
    Escrow internal escrow;
    Forwarder internal forwarder;

    function _deployCore() internal {
        device = vm.addr(devicePrivateKey);

        forwarder = new Forwarder();
        agriToken = new AgriToken(admin);
        batchRegistry = new BatchRegistry(admin, address(forwarder));
        priceOracle = new FairPriceOracle(admin);
        weighbridge = new WeighbridgeRegistry(admin);
        escrow = new Escrow(admin, batchRegistry, priceOracle, weighbridge, agriToken);

        vm.startPrank(admin);
        batchRegistry.grantRole(batchRegistry.LOGISTICS_ROLE(), logistics);
        batchRegistry.grantRole(batchRegistry.ESCROW_ROLE(), address(escrow));
        priceOracle.grantRole(priceOracle.FEED_ROLE(), feed);
        weighbridge.grantRole(weighbridge.LOGISTICS_ROLE(), logistics);
        escrow.grantRole(escrow.ESCROW_OPERATOR_ROLE(), admin);
        agriToken.mint(buyer, 1_000_000 ether);
        vm.stopPrank();
    }

    function _registerBatch(uint256 quantityKg) internal returns (uint256 batchId) {
        vm.prank(farmer);
        batchId = batchRegistry.registerBatch("wheat", quantityKg, "geohash123", "ipfsCID123");
    }

    function _setPrice(uint256 pricePerKg) internal {
        vm.prank(feed);
        priceOracle.setDailyPrice("wheat", pricePerKg, "agmarknet://wheat");
    }

    function _openEscrow(uint256 batchId, uint256 price, uint256 depositAmount) internal {
        vm.startPrank(buyer);
        agriToken.approve(address(escrow), depositAmount);
        escrow.openEscrow(batchId, price);
        vm.stopPrank();
    }

    function _deliverBatch(uint256 batchId) internal {
        vm.startPrank(logistics);
        batchRegistry.markInTransit(batchId);
        batchRegistry.markDelivered(batchId, 90);
        vm.stopPrank();
    }

    function _assignDevice(uint256 batchId) internal {
        vm.prank(logistics);
        weighbridge.assignDevice(batchId, device, "Model-X", "SN-001");
    }

    function _signWeight(uint256 batchId, uint256 weightKg, uint256 nonce) internal view returns (bytes memory) {
        bytes32 messageHash =
            keccak256(abi.encodePacked(address(weighbridge), block.chainid, batchId, weightKg, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(devicePrivateKey, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }

    function _recordWeight(uint256 batchId, uint256 weightKg, uint256 nonce) internal {
        bytes memory sig = _signWeight(batchId, weightKg, nonce);
        weighbridge.recordVerifiedWeight(batchId, weightKg, sig, nonce);
    }
}
