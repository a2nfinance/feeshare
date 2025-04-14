// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITreasury {
    // Events
    event FundAdded(address tokenAddress, address sender, uint256 amount);
    event WhitelistedTokenAdded(address tokenAddress);
    event WhitelistedTokenRemoved(address tokenAddress);
    event WhitelistedFunderAdded(address funderAddress);
    event WhitelistedFunderRemoved(address funderAddress);
    event FundSent(address tokenAddress, address to, uint256 amount);
    event EmergencyWithdrawal(address withdrawnTo);

    /**
     * @dev Adds funds to the treasury. Only whitelisted accounts can add whitelisted tokens.
     * @param _tokenAddress The address of the token to add.
     * @param _amount The amount of tokens to add.
     */
    function addFund(address _tokenAddress, uint256 _amount) external;

    /**
     * @dev Adds a token to the whitelist. Only the owner can call this function.
     * @param _tokenAddress The address of the token to whitelist.
     */
    function addWhitelistedToken(address _tokenAddress) external;

    /**
     * @dev Removes a token from the whitelist. Only the owner can call this function.
     * @param _tokenAddress The address of the token to remove.
     */
    function removeWhitelistedToken(address _tokenAddress) external;

    /**
     * @dev Adds an account to the whitelisted funders. Only the owner can call this function.
     * @param _funderAddress The address of the funder to whitelist.
     */
    function addWhitelistedFunder(address _funderAddress) external;


    /**
     * @dev Removes an account from the whitelisted funders. Only the owner can call this function.
     * @param _funderAddress The address of the funder to remove.
     */
    function removeWhitelistedFunder(address _funderAddress) external;


    /**
     * @dev Sends funds from the treasury. Only the DAO contract can call this function.
     * @param _tokenAddress The address of the token to send.
     * @param _to The address to send the tokens to.
     * @param _amount The amount of tokens to send.
     */
    function sendFund(address _tokenAddress, address _to, uint256 _amount) external;



    /**
     * @dev Returns whether a token is whitelisted.
     * @param _tokenAddress The address of the token to check.
     * @return True if the token is whitelisted, false otherwise.
     */
    function isWhitelistedToken(address _tokenAddress) external view returns (bool);



    /**
     * @dev Returns whether an account is a whitelisted funder.
     * @param _funderAddress The address of the funder to check.
     * @return True if the account is whitelisted, false otherwise.
     */
    function isWhitelistedFunder(address _funderAddress) external view returns (bool);

    /**
     * @dev Returns the number of whitelisted tokens.
     * @return The number of whitelisted tokens.
     */
    function getWhitelistedTokenCount() external view returns (uint256);


    /**
     * @dev Returns the address of a whitelisted token at a given index.
     * @param _index The index of the token to retrieve.
     * @return The address of the token.
     */
    function getWhitelistedTokenAtIndex(uint256 _index) external view returns (address);


    /**
     * @dev Returns the number of whitelisted funders.
     * @return The number of whitelisted funders.
     */
    function getWhitelistedFunderCount() external view returns (uint256);


    /**
     * @dev Returns the address of a whitelisted funder at a given index.
     * @param _index The index of the funder to retrieve.
     * @return The address of the funder.
     */
    function getWhitelistedFunderAtIndex(uint256 _index) external view returns (address);


    /**
     * @dev Updates the DAO contract address. Only the owner can call this function.
     * @param _newDaoContractAddress The new address of the DAO contract.
     */
    function updateDaoContractAddress(address _newDaoContractAddress) external;


    /**
     * @dev Emergency function to withdraw all whitelisted tokens to a specified address.
     *      This function is intended for emergency situations where the funds need to be quickly moved.
     *      It can only be called by the contract owner.
     * @param _withdrawnTo The address to send the tokens to.
     */
    function emergencyWithdrawal(address _withdrawnTo) external;
}