// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Single-feed daily price oracle. Honest framing: this is a trusted feed key for the
/// demo, not a decentralized oracle network — say so in the pitch (see PLAN.md "Honest framing").
contract FairPriceOracle is AccessControl {
    bytes32 public constant FEED_ROLE = keccak256("FEED_ROLE");

    /// @dev Price update more than this many basis points from the prior reading emits an
    /// alert instead of silently accepting a fat-fingered or manipulated price.
    uint256 public constant JUMP_GUARD_BPS = 2000; // 20%
    uint256 private constant BPS_DENOMINATOR = 10_000;

    struct PriceEntry {
        uint256 pricePerKg;
        uint256 timestamp;
        string sourceUri;
    }

    mapping(string => PriceEntry) private _latestPrice;

    /// @dev `crop` is deliberately NOT indexed: an indexed `string` only stores keccak256(crop)
    /// in the log topic, not the string itself — off-chain consumers (the indexer) would only
    /// ever recover a hash, never "wheat" back. Found by actually running the indexer against a
    /// live chain, not by reading the code.
    event PriceUpdated(string crop, uint256 pricePerKg, string sourceUri, uint256 timestamp);
    event PriceJumpFlagged(string crop, uint256 previousPrice, uint256 newPrice);

    error NoPriceSet(string crop);
    error ZeroPrice();

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function setDailyPrice(string calldata crop, uint256 pricePerKg, string calldata sourceUri)
        external
        onlyRole(FEED_ROLE)
    {
        if (pricePerKg == 0) revert ZeroPrice();

        uint256 previous = _latestPrice[crop].pricePerKg;
        if (previous != 0) {
            uint256 diff = pricePerKg > previous ? pricePerKg - previous : previous - pricePerKg;
            if (diff * BPS_DENOMINATOR / previous > JUMP_GUARD_BPS) {
                emit PriceJumpFlagged(crop, previous, pricePerKg);
            }
        }

        _latestPrice[crop] = PriceEntry({pricePerKg: pricePerKg, timestamp: block.timestamp, sourceUri: sourceUri});
        emit PriceUpdated(crop, pricePerKg, sourceUri, block.timestamp);
    }

    /// @return pricePerKg the latest recorded price
    /// @return ageSeconds how long ago the price was set
    function getPrice(string calldata crop) external view returns (uint256 pricePerKg, uint256 ageSeconds) {
        PriceEntry memory entry = _latestPrice[crop];
        if (entry.timestamp == 0) revert NoPriceSet(crop);
        return (entry.pricePerKg, block.timestamp - entry.timestamp);
    }
}
