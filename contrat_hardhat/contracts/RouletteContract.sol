// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RouletteContract {
    address public owner;
    uint256 public betAmount;
    uint256 public betColor;
    uint256 public winningColor;
    address public winner;
    uint randNonce = 0;

    event SpinResult(address indexed player, bool won, uint256 payout, uint256 contractBalance);

    constructor() {
        owner = msg.sender;
    }

    function spinWheel(uint256 _betColor) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        
        betAmount = msg.value;
        winningColor = randomWinningColor();
        betColor = _betColor;
        
        if (winningColor == betColor) {
            uint256 payout = betAmount * 2;
            emit SpinResult(msg.sender, true, payout, address(this).balance); // Emit event for winning
            payable(msg.sender).transfer(payout); // Pay out double the bet amount for winning
        } else {
            uint256 payout = 0;
            emit SpinResult(msg.sender, false, payout, address(this).balance); // Emit event for losing
        }
    }


    function randomWinningColor() private returns (uint256) {
        randNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % 2;
    }

    // Function to fund the contract
    function fundContract() external payable {
        require(msg.value > 0, "Must send ETH to fund the contract");
    }

    // Function to withdraw contract balance
    function withdrawFunds(uint256 amount) external {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        require(address(this).balance >= amount, "Insufficient funds");
        payable(owner).transfer(amount);
    }
}
