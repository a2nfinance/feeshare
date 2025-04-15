// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Program.sol";
import "./Reward.sol";
import "../structs/Structs.sol";
import "../interfaces/IProgramFactory.sol";

/**
 * @title ProgramFactory
 * @author Your Name
 * @notice This contract facilitates the creation of ProgramContract and Reward instances.
 */
contract ProgramFactory is IProgramFactory {

    /**
     * @dev Creates a new Program and Reward pair.
     * @param _daoAddress The address of the DAO contract.
     * @param _startDate The start date of the program.
     * @param _endDate The end date of the program.
     * @param _fixedRewardPercentage The fixed reward percentage.
     * @param _rewardRules The reward rules.
     * @param _avsSubmitContractAddress The address of the AVS Submit Contract for Reward.
     */
    function createContracts(
        address _daoAddress,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _fixedRewardPercentage,
        Structs.Rule[] memory _rewardRules,
        address _avsSubmitContractAddress
    ) external {
        // Create Program
        // Require(_daoAddress == msg.sender, "Sender != DAOAddress");
        // Need to check whether _daoAddress must be StandardDAO contract.

        Program programContract = new Program(
            msg.sender,
            _daoAddress,
            _startDate,
            _endDate,
            _fixedRewardPercentage,
            _rewardRules
        );

        // Create Reward contract
        Reward rewardContract = new Reward(
            msg.sender,
            address(programContract),
            _avsSubmitContractAddress
        );

        emit ProgramCreated(address(programContract), address(rewardContract));
    }

}