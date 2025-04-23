// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "../structs/Structs.sol";

interface IProgram {

    /**
     * @dev Updates the reward rules and fixed reward percentage.
     * @param _newFixedRewardPercentage The new fixed reward percentage.
     * @param _newRewardRules A mapping of amount to reward percentage.
     */
    function updateRules(uint256 _newFixedRewardPercentage, Structs.Rule[] memory _newRewardRules) external;

    /**
     * @dev Adds whitelisted application contracts. Only the DAO address can call this function.
     * @param _appId The ID of the application.
     * @param _contracts An array of contract addresses to whitelist.
     */
    function addWhitelistedAppContracts(uint256 _appId, address[] memory _contracts) external;

    /**
     * @dev Removes all whitelisted contracts for a specific app. Only the DAO address can call this function.
     * @param _appId The ID of the application.
     */
    function removeWhitelistedApp(uint256 _appId) external;

    /**
     * @dev Add all whitelisted app for a specific app. Only the DAO address can call this function.
     * @param _app The data of the application.
     * @param _whitelistedAppContracts An array of contract addresses to whitelist.
     */
    function addWhitelistedApp(Structs.App memory _app, address[] memory _whitelistedAppContracts) external;

    /**
     * @dev Removes a specific whitelisted contract for a specific app. Only the DAO address can call this function.
     * @param _appId The ID of the application.
     * @param _contractAddress The address of the contract to remove.
     */
    function removeWhitelistedAppContract(uint256 _appId, address _contractAddress) external;


    /**
     * @dev Updates the DAO contract address. Only the owner can call this function.
     * @param _newDaoAddress The new address of the DAO contract.
     */
    function updateDaoAddress(address _newDaoAddress) external;


    /**
     * @dev Updates the program start and end dates. Only the owner can call this function.
     * @param _newStartDate The new start date of the program.
     * @param _newEndDate The new end date of the program.
     */
    function updateProgramDates(uint256 _newStartDate, uint256 _newEndDate) external;

    /**
     * @dev Sets the beneficiary address for a specific app. Only the owner can call this function.
     * @param _appId The ID of the application.
     * @param _beneficiary The wallet address of the beneficiary.
     */
    function setBeneficiaryApp(uint256 _appId, address _beneficiary) external;


    /**
     * @dev Update reward type
     * @param _rewardType The reward type of program.
     */
     function setRewardType(uint256 _rewardType) external;

    /**
     * @dev Returns whether a contract address is whitelisted for a specific app.
     * @param _appId The ID of the application.
     * @param _contractAddress The address of the contract to check.
     * @return True if the contract is whitelisted, false otherwise.
     */
    function isContractWhitelisted(uint256 _appId, address _contractAddress) external view returns (bool);


    /**
     * @dev Returns whether a contract address is whitelisted for a specific app.
     * @param _appId The ID of the application.
     * @return True if the contract is whitelisted, false otherwise.
     */
    function isAppWhitelisted(uint256 _appId) external view returns (bool);

    /**
     * @dev Returns rule.
     * @param _index The ID of the rule.
     * @return Structs.Rule
     */
    function getRewardRule(uint256 _index) external view returns (Structs.Rule memory);

    /**
     * @dev Returns rewardRules.
     * @return Structs.Rule[] memory
     */
    function getRewardRules() external view returns (Structs.Rule[] memory);


    // Events
    event RulesUpdated(uint256 fixedRewardPercentage);
    event WhitelistedAppContractsAdded(uint256 appId, address[] contracts);
    event WhitelistedAppRemoved(uint256 appId);
    event WhitelistedAppContractRemoved(uint256 appId, address contractAddress);
}