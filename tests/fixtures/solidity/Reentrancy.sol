// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Vault {
    uint256 public balance;

    function withdraw() public {
        payable(msg.sender).transfer(balance);
        balance = 0;
    }
}
```