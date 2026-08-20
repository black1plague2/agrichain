// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {AgriToken} from "../src/AgriToken.sol";
import {BatchRegistry} from "../src/BatchRegistry.sol";
import {FairPriceOracle} from "../src/FairPriceOracle.sol";
import {WeighbridgeRegistry} from "../src/WeighbridgeRegistry.sol";
import {Escrow} from "../src/Escrow.sol";
import {Forwarder} from "../src/Forwarder.sol";

/// @notice Deploys the full AgriChain contract set with deterministic ordering and wires up
/// the role grants each contract needs from the others. Run with:
///   forge script script/Deploy.s.sol --rpc-url amoy --broadcast --verify
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        address oracleFeed = vm.envOr("ORACLE_FEED_ADDRESS", deployer);
        address logistics = vm.envOr("LOGISTICS_ADDRESS", deployer);
        address escrowOperator = vm.envOr("ESCROW_OPERATOR_ADDRESS", deployer);

        vm.startBroadcast(deployerKey);

        Forwarder forwarder = new Forwarder();
        AgriToken agriToken = new AgriToken(deployer);
        BatchRegistry batchRegistry = new BatchRegistry(deployer, address(forwarder));
        FairPriceOracle priceOracle = new FairPriceOracle(deployer);
        WeighbridgeRegistry weighbridge = new WeighbridgeRegistry(deployer);
        Escrow escrow = new Escrow(deployer, batchRegistry, priceOracle, weighbridge, agriToken);

        batchRegistry.grantRole(batchRegistry.LOGISTICS_ROLE(), logistics);
        batchRegistry.grantRole(batchRegistry.ESCROW_ROLE(), address(escrow));
        priceOracle.grantRole(priceOracle.FEED_ROLE(), oracleFeed);
        weighbridge.grantRole(weighbridge.LOGISTICS_ROLE(), logistics);
        escrow.grantRole(escrow.ESCROW_OPERATOR_ROLE(), escrowOperator);

        vm.stopBroadcast();

        console.log("Forwarder:          ", address(forwarder));
        console.log("AgriToken:          ", address(agriToken));
        console.log("BatchRegistry:      ", address(batchRegistry));
        console.log("FairPriceOracle:    ", address(priceOracle));
        console.log("WeighbridgeRegistry:", address(weighbridge));
        console.log("Escrow:             ", address(escrow));
    }
}
