// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../structs/Structs.sol";
import "../interfaces/IProgram.sol";
/**
 * @title Program
 * @author Your Name
 * @notice This contract defines a program with reward rules, whitelisted applications, and beneficiaries.
 */
contract Program is Ownable, IProgram {
    // DAO Address
    address public daoAddress;

    // Program Start and End Dates
    uint256 public startDate;
    uint256 public endDate;

    // Fixed Reward Percentage
    uint256 public fixedRewardPercentage;

    // Reward Rules: amount, rewardPercentage
    Structs.Rule[] public rewardRules;

    // Whitelisted Application Contracts: appId -> array of contract Addresses
    mapping(uint256 => address[]) public whitelistedAppContracts;

    // Beneficiary Application: appId -> wallet address
    mapping(uint256 => address) public beneficiaryApp;



    /**
     * @dev Initializes the ProgramContract.
     * @param _daoAddress The address of the DAO contract.
     * @param _startDate The start date of the program.
     * @param _endDate The end date of the program.
     * @param _fixedRewardPercentage The fixed reward percentage.
     */
    constructor(
        address _daoAddress,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _fixedRewardPercentage
    ) Ownable(msg.sender) {
        require(_daoAddress != address(0), "DAO address cannot be zero.");
        require(_startDate < _endDate, "Start date must be before end date.");

        daoAddress = _daoAddress;
        startDate = _startDate;
        endDate = _endDate;
        fixedRewardPercentage = _fixedRewardPercentage;
    }

    /**
     * @inheritdoc IProgram
     */
    function updateRules(uint256 _newFixedRewardPercentage, Structs.Rule[] memory _newRewardRules) external onlyOwner {
        fixedRewardPercentage = _newFixedRewardPercentage;
        rewardRules = _newRewardRules;

        emit RulesUpdated(_newFixedRewardPercentage);
    }

    /**
     * @inheritdoc IProgram
     */
    function addWhitelistedAppContracts(uint256 _appId, address[] memory _contracts) external {
        require(msg.sender == daoAddress, "Only the DAO address can call this function.");
        require(_contracts.length > 0, "Contracts array cannot be empty.");

        for (uint256 i = 0; i < _contracts.length; i++) {
            require(_contracts[i] != address(0), "Contract address cannot be zero.");
            whitelistedAppContracts[_appId].push(_contracts[i]);
        }

        emit WhitelistedAppContractsAdded(_appId, _contracts);
    }

    /**
     * @inheritdoc IProgram
     */
    function removeWhitelistedApp(uint256 _appId) external {
        require(msg.sender == daoAddress, "Only the DAO address can call this function.");

        delete whitelistedAppContracts[_appId];

        emit WhitelistedAppRemoved(_appId);
    }

    /**
     * @inheritdoc IProgram
     */
    function removeWhitelistedAppContract(uint256 _appId, address _contractAddress) external {
        require(msg.sender == daoAddress, "Only the DAO address can call this function.");
        require(_contractAddress != address(0), "Contract address cannot be zero.");

        address[] storage contracts = whitelistedAppContracts[_appId];
        for (uint256 i = 0; i < contracts.length; i++) {
            if (contracts[i] == _contractAddress) {
                // Replace the contract to be removed with the last contract in the array
                contracts[i] = contracts[contracts.length - 1];
                // Remove the last contract, effectively removing the desired contract
                contracts.pop();
                emit WhitelistedAppContractRemoved(_appId, _contractAddress);
                return;
            }
        }
        revert("Contract address is not whitelisted for this app.");
    }

    /**
     * @inheritdoc IProgram
     */
    function updateDaoAddress(address _newDaoAddress) external onlyOwner {
        require(_newDaoAddress != address(0), "DAO address cannot be zero.");
        daoAddress = _newDaoAddress;
    }

    /**
     * @inheritdoc IProgram
     */
    function updateProgramDates(uint256 _newStartDate, uint256 _newEndDate) external onlyOwner {
        require(_newStartDate < _newEndDate, "Start date must be before end date.");
        startDate = _newStartDate;
        endDate = _newEndDate;
    }

    /**
     * @inheritdoc IProgram
     */
    function setBeneficiaryApp(uint256 _appId, address _beneficiary) external onlyOwner {
        require(_beneficiary != address(0), "Beneficiary address cannot be zero.");
        beneficiaryApp[_appId] = _beneficiary;
    }

    /**
     * @inheritdoc IProgram
     */
    function isContractWhitelisted(uint256 _appId, address _contractAddress) public view returns (bool) {
        address[] memory contracts = whitelistedAppContracts[_appId];
        for (uint256 i = 0; i < contracts.length; i++) {
            if (contracts[i] == _contractAddress) {
                return true;
            }
        }
        return false;
    }
}