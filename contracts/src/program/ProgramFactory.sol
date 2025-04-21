// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Program.sol";
import "./Reward.sol";
import "../structs/Structs.sol";
import "../interfaces/IProgramFactory.sol";

/**
 * @title ProgramFactory
 * @author a2nfinance
 * @notice This contract facilitates the creation of ProgramContract and Reward instances.
 */
contract ProgramFactory is IProgramFactory {

     /**
     * @inheritdoc IProgramFactory
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
    ) external {
        Program programContract = new Program(
            msg.sender,
            _title,
            _daoAddress,
            _startDate,
            _endDate,
            _fixedRewardPercentage,
            _rewardRules,
            _rewardType
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