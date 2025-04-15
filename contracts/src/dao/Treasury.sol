// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "../interfaces/ITreasury.sol";

/**
 * @title Treasury
 * @author Your Name
 * @notice This contract manages the DAO's treasury, allowing whitelisted accounts to add funds
 *         and the DAO contract to send funds.
 */
contract Treasury is Ownable, ReentrancyGuard, ITreasury {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Whitelisted tokens
    EnumerableSet.AddressSet private whitelistedTokens;

    // Whitelisted accounts to fund (can deposit funds)
    EnumerableSet.AddressSet private whitelistedFunders;

    // DAO Contract Address
    address public daoContractAddress;

    

     /**
     * @dev Initializes the TreasuryContract.
     * @param _creator The creator address.
     * @param _daoContractAddress The address of the DAO contract.
     * @param _initialWhitelistedTokens An array of initial whitelisted token addresses.
     * @param _initialWhitelistedFunders An array of initial whitelisted funder addresses.
     */
    constructor(
        address _creator,
        address _daoContractAddress,
        address[] memory _initialWhitelistedTokens,
        address[] memory _initialWhitelistedFunders
    ) Ownable(_creator) {
        require(_creator != address(0), "Creator address cannot be zero.");
        require(_daoContractAddress != address(0), "DAO address cannot be zero.");
        daoContractAddress = _daoContractAddress;

        // Add initial whitelisted tokens
        for (uint256 i = 0; i < _initialWhitelistedTokens.length; i++) {
            require(_initialWhitelistedTokens[i] != address(0), "Token address cannot be zero.");
            whitelistedTokens.add(_initialWhitelistedTokens[i]);
        }

        // Add initial whitelisted funders
        for (uint256 i = 0; i < _initialWhitelistedFunders.length; i++) {
            require(_initialWhitelistedFunders[i] != address(0), "Funder address cannot be zero.");
            whitelistedFunders.add(_initialWhitelistedFunders[i]);
        }
    }

    /**
     * @inheritdoc ITreasury
     */
    function addFund(address _tokenAddress, uint256 _amount) external nonReentrant {
        require(isWhitelistedFunder(msg.sender), "Only whitelisted funders can add funds.");
        require(isWhitelistedToken(_tokenAddress), "Token is not whitelisted.");
        require(_amount > 0, "Amount must be greater than zero.");

        IERC20 token = IERC20(_tokenAddress);
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed.");

        emit FundAdded(_tokenAddress, msg.sender, _amount);
    }

    /**
     * @inheritdoc ITreasury
     */
    function addWhitelistedToken(address _tokenAddress) external onlyOwner {
        require(_tokenAddress != address(0), "Token address cannot be zero.");
        require(!isWhitelistedToken(_tokenAddress), "Token already whitelisted.");

        whitelistedTokens.add(_tokenAddress);

        emit WhitelistedTokenAdded(_tokenAddress);
    }

    /**
     * @inheritdoc ITreasury
     */
    function removeWhitelistedToken(address _tokenAddress) external onlyOwner {
        require(isWhitelistedToken(_tokenAddress), "Token is not whitelisted.");

        whitelistedTokens.remove(_tokenAddress);

        emit WhitelistedTokenRemoved(_tokenAddress);
    }

    /**
     * @inheritdoc ITreasury
     */
    function addWhitelistedFunder(address _funderAddress) external onlyOwner {
        require(_funderAddress != address(0), "Funder address cannot be zero.");
        require(!isWhitelistedFunder(_funderAddress), "Funder already whitelisted.");

        whitelistedFunders.add(_funderAddress);

        emit WhitelistedFunderAdded(_funderAddress);
    }

    /**
     * @inheritdoc ITreasury
     */
    function removeWhitelistedFunder(address _funderAddress) external onlyOwner {
        require(isWhitelistedFunder(_funderAddress), "Funder is not whitelisted.");

        whitelistedFunders.remove(_funderAddress);

        emit WhitelistedFunderRemoved(_funderAddress);
    }

    /**
     * @inheritdoc ITreasury
     */
    function sendFund(address _tokenAddress, address _to, uint256 _amount) external nonReentrant {
        require(msg.sender == daoContractAddress, "Only the DAO contract can call this function.");
        require(_to != address(0), "Recipient address cannot be zero.");
        require(_amount > 0, "Amount must be greater than zero.");

        IERC20 token = IERC20(_tokenAddress);
        require(token.transfer(_to, _amount), "Transfer failed.");

        emit FundSent(_tokenAddress, _to, _amount);
    }

    /**
     * @inheritdoc ITreasury
     */
    function isWhitelistedToken(address _tokenAddress) public view returns (bool) {
        return whitelistedTokens.contains(_tokenAddress);
    }

    /**
     * @inheritdoc ITreasury
     */
    function isWhitelistedFunder(address _funderAddress) public view returns (bool) {
        return whitelistedFunders.contains(_funderAddress);
    }

    /**
     * @inheritdoc ITreasury
     */
    function getWhitelistedTokenCount() public view returns (uint256) {
        return whitelistedTokens.length();
    }

    /**
     * @inheritdoc ITreasury
     */
    function getWhitelistedTokenAtIndex(uint256 _index) public view returns (address) {
        require(_index < whitelistedTokens.length(), "Index out of bounds.");
        return whitelistedTokens.at(_index);
    }

    /**
     * @inheritdoc ITreasury
     */
    function getWhitelistedFunderCount() public view returns (uint256) {
        return whitelistedFunders.length();
    }

    /**
     * @inheritdoc ITreasury
     */
    function getWhitelistedFunderAtIndex(uint256 _index) public view returns (address) {
        require(_index < whitelistedFunders.length(), "Index out of bounds.");
        return whitelistedFunders.at(_index);
    }

    /**
     * @inheritdoc ITreasury
     */
    function updateDaoContractAddress(address _newDaoContractAddress) external onlyOwner {
        require(_newDaoContractAddress != address(0), "DAO address cannot be zero.");
        daoContractAddress = _newDaoContractAddress;
    }


    modifier onlyDAO() {
        require(msg.sender == daoContractAddress, "Not the DAO contract");
        _;
    }

   /**
     * @inheritdoc ITreasury
     */
    function emergencyWithdrawal(address _withdrawnTo) external onlyDAO nonReentrant {
        require(_withdrawnTo != address(0), "Withdrawal address cannot be zero.");
        uint256 balance = 0;
        uint256 tokenCount = whitelistedTokens.length();
        for (uint256 i = 0; i < tokenCount; i++) {
            address tokenAddress = whitelistedTokens.at(i);
            IERC20 token = IERC20(tokenAddress);
            balance = token.balanceOf(address(this));

            if (balance > 0) {
                require(token.transfer(_withdrawnTo, balance), "Emergency transfer failed.");
            }
        }

        balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = _withdrawnTo.call{value: balance}("");
            require(success, "Emergency native token transfer failed.");
        }

        emit EmergencyWithdrawal(_withdrawnTo);
        
    }
}