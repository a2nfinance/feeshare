// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Structs {
    enum Status {
        Open,
        Rejected,
        Executed
    }
    struct Proposal {
        string name;
        uint256 startDate;
        uint256 endDate;
        address targetContract;
        bytes callData;
        Status status;
        uint256 totalVotesFor;
        uint256 totalVotesAgainst;
        bool executed;
    }

    struct Rule {
        uint256 amount;
        uint256 rewardPercentage;
    }
}