// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/dao/DAOFactory.sol";
import "../src/dao/StandardDAO.sol";
import "../src/dao/Treasury.sol";
import "forge-std/console.sol";

contract DAOFactoryTest is Test {
    DAOFactory public daoFactory;
    address public owner;
    address public alice;
    address public bob;
    function setUp() public {
        owner = address(0x1);
        alice = address(0x2);
        bob = address(0x3);

        vm.prank(owner);
        daoFactory = new DAOFactory();
    }

    function testCreateContracts() public {
        string memory daoName = "My DAO";
        string memory daoDescription = "A test DAO";
        string memory daoXAccount = "MyDAO_X";
        string memory daoDiscordAccount = "MyDAO_Discord";
        uint256 daoQuorum = 50;
        uint256 daoVotingThreshold = 60;
        bool daoOnlyMembersCanPropose = true;
        bool daoAllowEarlierExecution = true;
        address[] memory initialWhitelistedTokens = new address[](1);
        initialWhitelistedTokens[0] = address(0x4);
        address[] memory initialWhitelistedFunders = new address[](1);
        initialWhitelistedFunders[0] = address(0x5);
        // Start capturing logs
        vm.recordLogs();
        vm.prank(owner);
        daoFactory.createContracts(
            daoName,
            daoDescription,
            daoXAccount,
            daoDiscordAccount,
            daoQuorum,
            daoVotingThreshold,
            daoOnlyMembersCanPropose,
            daoAllowEarlierExecution,
            initialWhitelistedTokens,
            initialWhitelistedFunders
        );

        // Get the DAOCreated event and extract the contract addresses
        (address daoContractAddress, address treasuryContractAddress) = getDAOCreatedAddresses();

        // Assert that the contracts were created
        assertTrue(daoContractAddress != address(0), "DAO contract address should not be zero");
        assertTrue(treasuryContractAddress != address(0), "Treasury contract address should not be zero");

        // Verify that the DAO contract has the correct parameters
        StandardDAO daoContract = StandardDAO(daoContractAddress);
        console.log("Owner:", address(daoContract.owner()));
        assertEq(daoContract.name(), daoName, "DAO name should be correct");
        assertEq(daoContract.description(), daoDescription, "DAO description should be correct");
        assertEq(daoContract.quorum(), daoQuorum, "DAO quorum should be correct");
        assertEq(daoContract.votingThreshold(), daoVotingThreshold, "DAO voting threshold should be correct");
        assertEq(daoContract.onlyMembersCanPropose(), daoOnlyMembersCanPropose, "DAO onlyMembersCanPropose should be correct");

        // Verify that the Treasury contract has the correct parameters
        Treasury treasuryContract = Treasury(treasuryContractAddress);
        assertEq(treasuryContract.daoContractAddress(), address(daoContract), "Treasury DAO address should be correct");
        assertTrue(treasuryContract.isWhitelistedToken(initialWhitelistedTokens[0]), "Token should be whitelisted");
        assertTrue(treasuryContract.isWhitelistedFunder(initialWhitelistedFunders[0]), "Funder should be whitelisted");
    }

    // Helper function to extract the DAO and Treasury contract addresses from the DAOCreated event
    function getDAOCreatedAddresses() internal returns (address daoContract, address treasuryContract) {
        // Get the emitted event
        Vm.Log[] memory logs = vm.getRecordedLogs();

        for (uint256 i = 0; i < logs.length; i++) {
            
            if (logs[i].topics[0] == keccak256("DAOCreated(address,address)")) {
                // daoContract = address(uint160(uint256(logs[i].topics[1])));
                // treasuryContract = address(uint160(uint256(logs[i].topics[2])));
                (daoContract, treasuryContract) = abi.decode(logs[i].data, (address, address));
                break;
            }
        }
        console.log("DAO Contract: %s, TreasuryContract: %s", daoContract, treasuryContract);
    }

    function testCreateContracts_RevertsIfNotOwner() public {
        string memory daoName = "My DAO";
        string memory daoDescription = "A test DAO";
        string memory daoXAccount = "MyDAO_X";
        string memory daoDiscordAccount = "MyDAO_Discord";
        uint256 daoQuorum = 50;
        uint256 daoVotingThreshold = 60;
        bool daoOnlyMembersCanPropose = true;
        bool daoAllowEarlierExecution = true;
        address[] memory initialWhitelistedTokens = new address[](1);
        initialWhitelistedTokens[0] = address(0x4);
        address[] memory initialWhitelistedFunders = new address[](1);
        initialWhitelistedFunders[0] = address(0x5);

        vm.prank(alice);
        vm.expectRevert();
        daoFactory.createContracts(
            daoName,
            daoDescription,
            daoXAccount,
            daoDiscordAccount,
            daoQuorum,
            daoVotingThreshold,
            daoOnlyMembersCanPropose,
            daoAllowEarlierExecution,
            initialWhitelistedTokens,
            initialWhitelistedFunders
        );
    }
}