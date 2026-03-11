// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GlazeStaking {
    struct Stake {
        uint256 amount;
        uint256 start;
    }

    mapping(address => Stake) public stakes;
    uint256 public constant LOCK_TIME = 30 days;

    function stake() external payable {
        require(msg.value > 0, "Send ETH to stake");
        
        Stake storage s = stakes[msg.sender];

        if (s.amount == 0) {
            s.amount = msg.value;
            s.start = block.timestamp;
        } else {
            s.amount += msg.value;
        }
    }

    function withdraw() external {
        Stake storage s = stakes[msg.sender];

        require(s.amount > 0, "No Stake");
        require(block.timestamp >= s.start + LOCK_TIME, "Still locked");

        //uint256 reward = s.amount / 10;
        uint256 payout = s.amount;

        delete stakes[msg.sender];

        payable(msg.sender).transfer(payout);
    }
}
