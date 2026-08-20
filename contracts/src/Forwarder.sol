// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC2771Forwarder} from "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

/// @notice EIP-2771 meta-transaction forwarder. The relayer backend submits farmer-signed
/// intents through this contract and pays gas; BatchRegistry sees the farmer as _msgSender()
/// via ERC2771Context. Nonce replay protection and request expiry are handled by OpenZeppelin's
/// audited ERC2771Forwarder — no custom relay logic reimplemented here.
contract Forwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("AgriChainForwarder") {}
}
