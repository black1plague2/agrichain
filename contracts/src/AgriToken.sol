// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Demo ERC20 standing in for INR settlement on Amoy testnet.
/// Production path: swap for a fiat on/off-ramp (UPI payout via a PA like Cashfree/Razorpay).
contract AgriToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Agri", "AGRI") Ownable(initialOwner) {}

    /// @notice Deployer-only mint for seeding demo balances. Not present in a production token.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
