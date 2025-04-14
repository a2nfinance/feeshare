// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "../structs/Structs.sol";

interface IProgramFactory {
    function createContracts(
        address _daoAddress,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _fixedRewardPercentage,
        Structs.Rule[] memory _rewardRules,
        address _avsSubmitContractAddress
    ) external;
    // Events
    event ProgramCreated(address programContract, address rewardContract);
}
