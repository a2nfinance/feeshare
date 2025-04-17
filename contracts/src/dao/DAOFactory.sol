// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StandardDAO.sol";
import "./Treasury.sol";
/**
 * @title DAOFactory
 * @author a2nfinance
 * @notice This contract facilitates the creation of StandardDAO and TreasuryContract instances.
 */
contract DAOFactory {
    // Events
    event DAOCreated(address daoContract, address treasuryContract);
    /**
     * @dev Creates a new StandardDAO and TreasuryContract pair.
     * @param _daoName The name of the DAO.
     * @param _daoDescription A brief description of the DAO.
     * @param _daoXAccount The X (Twitter) account of the DAO.
     * @param _daoDiscordAccount The Discord account of the DAO.
     * @param _daoQuorum The initial quorum for voting.
     * @param _daoVotingThreshold The initial voting threshold.
     * @param _daoOnlyMembersCanPropose Flag indicating if only members can create proposals.
     * @param _daoAllowEarlierExecution Flag indicating if if a proposal can be executed earlier.
     * @param _initialWhitelistedTokens An array of initial whitelisted token addresses for the TreasuryContract.
     * @param _initialWhitelistedFunders An array of initial whitelisted funder addresses for the TreasuryContract.
     */
    function createContracts(
        string memory _daoName,
        string memory _daoDescription,
        string memory _daoXAccount,
        string memory _daoDiscordAccount,
        uint256 _daoQuorum,
        uint256 _daoVotingThreshold,
        bool _daoOnlyMembersCanPropose,
        bool _daoAllowEarlierExecution,
        address[] memory _initialWhitelistedTokens,
        address[] memory _initialWhitelistedFunders,
        Structs.MemberWeight[] memory _memberWeightArr
    ) external {
        // Create StandardDAO
        StandardDAO daoContract = new StandardDAO(
            msg.sender,
            _daoName,
            _daoDescription,
            _daoXAccount,
            _daoDiscordAccount,
            _daoQuorum,
            _daoVotingThreshold,
            _daoOnlyMembersCanPropose,
            _daoAllowEarlierExecution,
            _memberWeightArr
        );

        // Create TreasuryContract
        Treasury treasuryContract = new Treasury(
            msg.sender,
            address(daoContract), // Placeholder, DAO address is set later
            _initialWhitelistedTokens,
            _initialWhitelistedFunders
        );
        emit DAOCreated(address(daoContract), address(treasuryContract));
    }
}