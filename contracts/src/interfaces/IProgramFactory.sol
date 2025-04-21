// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "../structs/Structs.sol";

interface IProgramFactory {
    /**
     * @dev Creates a new Program and Reward pair.
     * @param _title The program title.
     * @param _daoAddress The address of the DAO contract.
     * @param _startDate The start date of the program.
     * @param _endDate The end date of the program.
     * @param _fixedRewardPercentage The fixed reward percentage.
     * @param _rewardRules The reward rules.
     * @param _avsSubmitContractAddress The address of the AVS Submit Contract for Reward.
     * @param _rewardType The reward type of a program.
     */
    function createContracts(
        string memory _title,
        address _daoAddress,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _fixedRewardPercentage,
        Structs.Rule[] memory _rewardRules,
        address _avsSubmitContractAddress,
        uint256 _rewardType
    ) external;
    
    // Events
    event ProgramCreated(address programContract, address rewardContract);
}
