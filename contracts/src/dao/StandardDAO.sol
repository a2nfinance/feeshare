// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../structs/Structs.sol";
import "../interfaces/IStandardDAO.sol";
/**
 * @title StandardDAO
 * @author a2nfinance
 * @notice This contract implements a standard DAO with voting, proposals, and member management.
 */
contract StandardDAO is Ownable, IStandardDAO {
    using EnumerableSet for EnumerableSet.AddressSet;
    using Math for uint256;
    uint256 public denominator = 10000;
    // General Info
    string public name;
    string public description;
    address public creator;
    string public xAccount;
    string public discordAccount;

    // Voting Parameters
    uint256 public quorum;
    uint256 public votingThreshold;

    // Members
    mapping(address => uint256) public memberWeight;
    EnumerableSet.AddressSet private members;

    // Proposal Permissions
    bool public onlyMembersCanPropose;

    // Proposal execute mechanism
    bool public allowEarlierExecution;

    Structs.Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    /**
     * @dev Initializes the DAO.
     * @param _creator The creator address.
     * @param _name The name of the DAO.
     * @param _description A brief description of the DAO.
     * @param _xAccount The X (Twitter) account of the DAO.
     * @param _discordAccount The Discord account of the DAO.
     * @param _quorum The initial quorum for voting.
     * @param _votingThreshold The initial voting threshold.
     * @param _onlyMembersCanPropose Flag indicating if only members can create proposals.
     * @param _allowEarlierExecution Flag indicating if a proposal can be executed earlier.
     */
    constructor(
        address _creator,
        string memory _name,
        string memory _description,
        string memory _xAccount,
        string memory _discordAccount,
        uint256 _quorum,
        uint256 _votingThreshold,
        bool _onlyMembersCanPropose,
        bool _allowEarlierExecution,
        Structs.MemberWeight[] memory _memberWeightArr
    ) Ownable(_creator) {
        name = _name;
        description = _description;
        creator = _creator;
        xAccount = _xAccount;
        discordAccount = _discordAccount;
        quorum = _quorum;
        votingThreshold = _votingThreshold;
        onlyMembersCanPropose = _onlyMembersCanPropose;
        allowEarlierExecution = _allowEarlierExecution;
        for(uint256 i = 0; i < _memberWeightArr.length; i++) {
            members.add(_memberWeightArr[i].memberAddress);
            memberWeight[_memberWeightArr[i].memberAddress] = _memberWeightArr[i].weight;
        }
    }

    /**
     * @inheritdoc IStandardDAO
     */
    function createProposal(
        string memory _name,
        address _targetContract,
        bytes memory _callData,
        uint256 _durationInDays
    ) public {
        require(!onlyMembersCanPropose || isMember(msg.sender), "Only members can create proposals.");
        require(_durationInDays > 0, "Duration must be greater than zero.");

        uint256 startDate = block.timestamp;
        uint256 endDate = startDate + (_durationInDays * 1 days);

        proposals.push(
            Structs.Proposal({
                name: _name,
                startDate: startDate,
                endDate: endDate,
                targetContract: _targetContract,
                callData: _callData,
                status: Structs.Status.Open,
                totalVotesFor: 0,
                totalVotesAgainst: 0,
                executed: false
            })
        );

        emit ProposalCreated(proposals.length - 1, _name, msg.sender);
    }

    /**
     * @inheritdoc IStandardDAO
     */
    function addMember(address _member, uint256 _weight) public onlyOwner {
        require(!isMember(_member), "Member already exists.");
        require(_weight > 0, "Weight must be greater than zero.");

        members.add(_member);
        memberWeight[_member] = _weight;

        emit MemberAdded(_member, _weight);
    }

    /**
     * @inheritdoc IStandardDAO
     */
    function removeMember(address _member) public onlyOwner {
        require(isMember(_member), "Member does not exist.");

        members.remove(_member);
        delete memberWeight[_member];

        emit MemberRemoved(_member);
    }

    /**
     * @inheritdoc IStandardDAO
     */
    function vote(uint256 _proposalId, bool _support) public {
        require(isMember(msg.sender), "Only members can vote.");
        require(_proposalId < proposals.length, "Invalid proposal ID.");
        require(proposals[_proposalId].status == Structs.Status.Open, "Proposal is not open for voting.");
        require(block.timestamp >= proposals[_proposalId].startDate && block.timestamp <= proposals[_proposalId].endDate, "Voting is not active.");
        require(!hasVoted[_proposalId][msg.sender], "Already voted.");

        hasVoted[_proposalId][msg.sender] = true;

        if (_support) {
            proposals[_proposalId].totalVotesFor += memberWeight[msg.sender];
        } else {
            proposals[_proposalId].totalVotesAgainst += memberWeight[msg.sender];
        }

        emit VoteCast(_proposalId, msg.sender, _support);
    }

    /**
     * @inheritdoc IStandardDAO
     */
    function executeProposal(uint256 _proposalId) public {
        require(isMember(msg.sender), "Only members can execute proposal.");
        require(_proposalId < proposals.length, "Invalid proposal ID.");
        require(proposals[_proposalId].status == Structs.Status.Open, "Proposal is not open.");
        require(!proposals[_proposalId].executed, "Proposal already executed.");
        if (!allowEarlierExecution) {
            require(block.timestamp > proposals[_proposalId].endDate, "Voting period has not ended.");
        }
        
        uint256 totalVotes = 0;
        for (uint256 i = 0; i < members.length(); i++) {
            if (hasVoted[_proposalId][members.at(i)]) {
                totalVotes += 1;
            }
            
        }

        uint256 totalVotesFor = proposals[_proposalId].totalVotesFor;
        uint256 totalVotesAgainst = proposals[_proposalId].totalVotesAgainst;

        require((totalVotes * denominator / members.length()) >= quorum, "Quorum not reached.");
        require((totalVotesFor * denominator / (totalVotesFor + totalVotesAgainst)) >= votingThreshold, "Voting threshold not reached.");

        proposals[_proposalId].status = Structs.Status.Executed;
        proposals[_proposalId].executed = true;

        (bool success, ) = proposals[_proposalId].targetContract.call(proposals[_proposalId].callData);
        require(success, "Call failed.");

        emit ProposalExecuted(_proposalId, msg.sender);
    }

    function _isAllowExecute(uint256 _proposalId) internal view returns (bool) {
        uint256 totalVotes = 0;
        for (uint256 i = 0; i < members.length(); i++) {
            if (hasVoted[_proposalId][members.at(i)]) {
                totalVotes += 1;
            }
            
        }

        uint256 totalVotesFor = proposals[_proposalId].totalVotesFor;
        uint256 totalVotesAgainst = proposals[_proposalId].totalVotesAgainst;

        return (totalVotes * denominator / members.length()) >= quorum && (totalVotesFor * denominator / (totalVotesFor + totalVotesAgainst)) >= votingThreshold;
       
    }

    /**
     * @inheritdoc IStandardDAO
     */
    function updateDAO(
        uint256 _newQuorum,
        uint256 _newVotingThreshold,
        bool _onlyMembersCanPropose
    ) public onlyOwner {
        quorum = _newQuorum;
        votingThreshold = _newVotingThreshold;
        onlyMembersCanPropose = _onlyMembersCanPropose;

        emit DAOUpdated(_newQuorum, _newVotingThreshold);
    }

    /**
     * @inheritdoc IStandardDAO
     */
    function isMember(address _member) public view returns (bool) {
        return members.contains(_member);
    }

    /**
     * @inheritdoc IStandardDAO
     */
    function getMemberCount() public view returns (uint256) {
        return members.length();
    }

    /**
     * @inheritdoc IStandardDAO
     */
    function getMemberAtIndex(uint256 _index) public view returns (address) {
        require(_index < members.length(), "Index out of bounds.");
        return members.at(_index);
    }

    /**
     * @inheritdoc IStandardDAO
     */
    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }
    /**
     * @inheritdoc IStandardDAO
     */
    function getVotingStatus(uint256 _proposalId) public view returns (uint256, uint256, uint256, Structs.Proposal memory, bool) {
        return (members.length(), quorum, votingThreshold, proposals[_proposalId], _isAllowExecute(_proposalId));
    }

}