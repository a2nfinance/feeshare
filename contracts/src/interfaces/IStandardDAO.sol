// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStandardDAO {
    /**
     * @dev Creates a new proposal.
     * @param _name The name of the proposal.
     * @param _targetContract The address of the contract to be called.
     * @param _callData The calldata to be executed on the target contract.
     * @param _durationInDays The duration of the proposal in days.
     */
    function createProposal(
        string memory _name,
        address _targetContract,
        bytes memory _callData,
        uint256 _durationInDays
    ) external;

    /**
     * @dev Adds a new member to the DAO.
     * @param _member The address of the member to add.
     * @param _weight The weight of the member's vote.
     */
    function addMember(address _member, uint256 _weight) external;

    /**
     * @dev Removes a member from the DAO.
     * @param _member The address of the member to remove.
     */
    function removeMember(address _member) external;


    /**
     * @dev Casts a vote for a proposal.
     * @param _proposalId The ID of the proposal.
     * @param _support True to vote in favor, false to vote against.
     */
    function vote(uint256 _proposalId, bool _support) external;


    /**
     * @dev Executes a proposal if it has passed and has not been executed yet.
     * @param _proposalId The ID of the proposal to execute.
     */
    function executeProposal(uint256 _proposalId) external;

    /**
     * @dev Updates the DAO's parameters.
     * @param _newQuorum The new quorum for voting.
     * @param _newVotingThreshold The new voting threshold.
     * @param _onlyMembersCanPropose Flag indicating if only members can create proposals.
     */
    function updateDAO(
        uint256 _newQuorum,
        uint256 _newVotingThreshold,
        bool _onlyMembersCanPropose
    ) external;

    /**
     * @dev Returns whether an address is a member of the DAO.
     * @param _member The address to check.
     * @return True if the address is a member, false otherwise.
     */
    function isMember(address _member) external view returns (bool);

    /**
     * @dev Returns the number of members in the DAO.
     * @return The number of members.
     */
    function getMemberCount() external view returns (uint256);


    /**
     * @dev Returns the address of a member at a given index.
     * @param _index The index of the member to retrieve.
     * @return The address of the member.
     */
    function getMemberAtIndex(uint256 _index) external view returns (address);

    /**
     * @dev Returns the number of proposals in the DAO.
     * @return The number of proposals.
     */
    function getProposalCount() external view returns (uint256);

    // Events
    event ProposalCreated(uint256 proposalId, string name, address proposer);
    event MemberAdded(address member, uint256 weight);
    event MemberRemoved(address member);
    event VoteCast(uint256 proposalId, address voter, bool support);
    event ProposalExecuted(uint256 proposalId, address executor);
    event DAOUpdated(uint256 newQuorum, uint256 newVotingThreshold);
}