// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";
import {Helpers} from "./Helpers.t.sol";
import {FairPriceOracle} from "../src/FairPriceOracle.sol";

contract FairPriceOracleTest is Helpers {
    function setUp() public {
        _deployCore();
    }

    function test_setDailyPrice_onlyFeedRole() public {
        vm.expectRevert();
        priceOracle.setDailyPrice("wheat", 30 ether, "src");

        _setPrice(30 ether);
        (uint256 price,) = priceOracle.getPrice("wheat");
        assertEq(price, 30 ether);
    }

    function test_setDailyPrice_revertsOnZeroPrice() public {
        vm.prank(feed);
        vm.expectRevert(FairPriceOracle.ZeroPrice.selector);
        priceOracle.setDailyPrice("wheat", 0, "src");
    }

    function test_getPrice_revertsForUnsetCrop() public {
        vm.expectRevert(abi.encodeWithSelector(FairPriceOracle.NoPriceSet.selector, "rice"));
        priceOracle.getPrice("rice");
    }

    function test_getPrice_reportsAge() public {
        _setPrice(30 ether);
        vm.warp(block.timestamp + 3 hours);

        (uint256 price, uint256 age) = priceOracle.getPrice("wheat");
        assertEq(price, 30 ether);
        assertEq(age, 3 hours);
    }

    function test_priceJump_emitsAlertButStillAccepts() public {
        _setPrice(30 ether);

        vm.recordLogs();
        _setPrice(45 ether); // +50%, over the 20% jump guard

        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 jumpTopic = keccak256("PriceJumpFlagged(string,uint256,uint256)");
        bool found = false;
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].topics[0] == jumpTopic) found = true;
        }
        assertTrue(found, "PriceJumpFlagged must fire on >20% move");

        (uint256 price,) = priceOracle.getPrice("wheat");
        assertEq(price, 45 ether, "price update is not blocked, only flagged");
    }

    function test_smallPriceChange_noJumpEvent() public {
        _setPrice(30 ether);

        vm.recordLogs();
        _setPrice(31 ether); // +3.3%, under threshold

        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 jumpTopic = keccak256("PriceJumpFlagged(string,uint256,uint256)");
        for (uint256 i = 0; i < logs.length; i++) {
            assertTrue(logs[i].topics[0] != jumpTopic, "PriceJumpFlagged must not fire under threshold");
        }
    }
}
