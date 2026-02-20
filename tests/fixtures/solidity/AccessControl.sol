// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Admin {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function setOwner(address newOwner) public {
        owner = newOwner;
    }

    function setOwnerOnly(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }
}
```