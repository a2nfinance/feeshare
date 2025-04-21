// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../structs/Structs.sol";
import "../interfaces/IProgram.sol";

/**
 * @title Program
 * @author a2nfinance
 * @notice This contract defines a program with reward rules, whitelisted applications, and beneficiaries.
 */
contract Program is Ownable, IProgram {
    // DAO Address
    address public daoAddress;

    string public name;

    // Program Start and End Dates
    uint256 public startDate;
    uint256 public endDate;

    // Reward Type

    uint256 public rewardType;

    // Fixed Reward Percentage
    uint256 public fixedRewardPercentage;

    // Array of whitelisted apps.
    Structs.App[] public apps;

    // Reward Rules: amount, rewardPercentage
    Structs.Rule[] public rewardRules;

    // Whitelisted Application Contracts: appId -> array of contract Addresses
    mapping(uint256 => address[]) public whitelistedAppContracts;

    // Beneficiary Application: appId -> wallet address
    mapping(uint256 => address) public beneficiaryApp;

    /**
     * @dev Initializes the ProgramContract.
     * @param _owner The owner address.
     * @param _title The program name.
     * @param _daoAddress The address of the DAO contract.
     * @param _startDate The start date of the program.
     * @param _endDate The end date of the program.
     * @param _fixedRewardPercentage The fixed reward percentage.
     * @param _rewardRules The reward rules.
     * @param _rewardType The reward type.
     */
    constructor(
        address _owner,
        string memory _title,
        address _daoAddress,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _fixedRewardPercentage,
        Structs.Rule[] memory _rewardRules,
        uint256 _rewardType
    ) Ownable(_owner) {
        require(_owner != address(0), "Owner address cannot be zero.");
        require(_daoAddress != address(0), "DAO address cannot be zero.");
        require(_startDate < _endDate, "Start date must be before end date.");

        name = _title;
        daoAddress = _daoAddress;
        startDate = _startDate;
        endDate = _endDate;
        fixedRewardPercentage = _fixedRewardPercentage;
        rewardType = _rewardType;
        for (uint i = 0; i < _rewardRules.length; i++) {
            rewardRules.push(_rewardRules[i]);
        }
    }

    /**
     * @inheritdoc IProgram
     */
    function updateRules(
        uint256 _newFixedRewardPercentage,
        Structs.Rule[] memory _newRewardRules
    ) external onlyOwner {
        fixedRewardPercentage = _newFixedRewardPercentage;
        delete rewardRules;
        for (uint i = 0; i < _newRewardRules.length; i++) {
            rewardRules.push(_newRewardRules[i]);
        }

        emit RulesUpdated(_newFixedRewardPercentage);
    }

    /**
     * @inheritdoc IProgram
     */
    function addWhitelistedAppContracts(
        uint256 _appId,
        address[] memory _contracts
    ) external onlyOwner {
        _addWhitelistedAppContracts(_appId, _contracts);
    }

    /**
     * To add whitelisted Contracts
     */
    function _addWhitelistedAppContracts(uint256 _appId,
        address[] memory _contracts
    ) internal {
        require(
            msg.sender == daoAddress,
            "Only the DAO address can call this function."
        );
        require(_contracts.length > 0, "Contracts array cannot be empty.");

        for (uint256 i = 0; i < _contracts.length; i++) {
            require(
                _contracts[i] != address(0),
                "Contract address cannot be zero."
            );
            whitelistedAppContracts[_appId].push(_contracts[i]);
        }

        emit WhitelistedAppContractsAdded(_appId, _contracts);
    }
    
    /**
     * @inheritdoc IProgram
     */
     function addWhitelistedApp(Structs.App memory _app, address[] memory _whitelistedAppContracts) external onlyOwner {
        // Validate here
        uint256 appId = apps.length;
        apps.push(_app);
        _setBeneficiaryApp(appId, _app.beneficiaryApp);
        _addWhitelistedAppContracts(appId, _whitelistedAppContracts);
     }

    /**
     * @inheritdoc IProgram
     */
    function removeWhitelistedApp(uint256 _appId) external onlyOwner {
        require(
            msg.sender == daoAddress,
            "Only the DAO address can call this function."
        );

        delete whitelistedAppContracts[_appId];

        emit WhitelistedAppRemoved(_appId);
    }

    /**
     * @inheritdoc IProgram
     */
    function removeWhitelistedAppContract(
        uint256 _appId,
        address _contractAddress
    ) external onlyOwner {
        require(
            msg.sender == daoAddress,
            "Only the DAO address can call this function."
        );
        require(
            _contractAddress != address(0),
            "Contract address cannot be zero."
        );

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
    function updateProgramDates(
        uint256 _newStartDate,
        uint256 _newEndDate
    ) external onlyOwner {
        require(
            _newStartDate < _newEndDate,
            "Start date must be before end date."
        );
        startDate = _newStartDate;
        endDate = _newEndDate;
    }

    /**
     * @inheritdoc IProgram
     */
    function setBeneficiaryApp(
        uint256 _appId,
        address _beneficiary
    ) external onlyOwner {
        _setBeneficiaryApp(_appId, _beneficiary);
    }

    /**
     * @inheritdoc IProgram
     */
    function setRewardType(
        uint256 _rewardType
    ) external onlyOwner {
        rewardType = _rewardType;
    }

    /**
     * To add beneficary address of whitelisted app
     */
    function _setBeneficiaryApp(
        uint256 _appId,
        address _beneficiary
    ) internal {
        require(
            _beneficiary != address(0),
            "Beneficiary address cannot be zero."
        );
        beneficiaryApp[_appId] = _beneficiary;
    }

    /**
     * @inheritdoc IProgram
     */
    function isContractWhitelisted(
        uint256 _appId,
        address _contractAddress
    ) public view returns (bool) {
        address[] memory contracts = whitelistedAppContracts[_appId];
        for (uint256 i = 0; i < contracts.length; i++) {
            if (contracts[i] == _contractAddress) {
                return true;
            }
        }
        return false;
    }

    /*
    * @inheritdoc IProgram
    */
    function isAppWhitelisted(
        uint256 _appId
    ) public view returns (bool) {
        address[] memory contracts = whitelistedAppContracts[_appId];
        if (contracts.length > 0) {
            return true;
        }
        return false;
    }

    function getRewardRule(uint256 _index) public view returns (Structs.Rule memory) {
        return rewardRules[_index];
    }
}
