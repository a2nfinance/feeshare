// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/dao/StandardDAO.sol";
import "../src/dao/Treasury.sol";
import "../src/program/ProgramFactory.sol";
import "../src/program/Program.sol";
import "../src/program/Reward.sol";
import "../src/structs/Structs.sol";
import "../src/interfaces/IProgramFactory.sol";

contract DAOTest is Test {
    StandardDAO public daoContract;
    Treasury public treasuryContract;
    ProgramFactory public programFactory;

    address public owner;
    address public alice;
    address public bob;
    address public avsSubmitContract;

    event ProgramCreated(address programContract, address rewardContract);

    function setUp() public {
        owner = address(0x1);
        alice = address(0x2);
        bob = address(0x3);
        avsSubmitContract = address(0x4);
        vm.deal(owner, 2 ether);
        vm.prank(owner);
        Structs.MemberWeight[]
            memory memberWeightArr = new Structs.MemberWeight[](3);
        memberWeightArr[0] = Structs.MemberWeight({
            memberAddress: owner,
            weight: 1
        });
        memberWeightArr[1] = Structs.MemberWeight({
            memberAddress: alice,
            weight: 2
        });
        memberWeightArr[2] = Structs.MemberWeight({
            memberAddress: bob,
            weight: 2
        });
        // Deploy DAO and Treasury contracts directly
        daoContract = new StandardDAO(
            owner,
            "My DAO",
            "A test DAO",
            "MyDAO_X",
            "MyDAO_Discord",
            50 * 100, // Quorum
            60 * 100, // Voting Threshold
            true, // Only Members Can Propose
            false, // Only Members Can Propose
            memberWeightArr
        );

        treasuryContract = new Treasury(
            owner,
            address(daoContract),
            new address[](0), // No initial whitelisted tokens
            new address[](0) // No initial whitelisted funders
        );

        (bool success, ) = payable(address(treasuryContract)).call{
            value: 0.5 ether
        }("");

        require(success, "Failed to send ETH");

        programFactory = new ProgramFactory();
        vm.prank(owner);
        daoContract.addMember(address(this), 1);
        console.log("Count members:", daoContract.getMemberCount());
    }

    function testCreateProgramViaDAO() public {
        // 1. Define the parameters for ProgramFactory.createContracts
        address daoAddress = address(daoContract);
        uint256 startDate = block.timestamp + 1 days;
        uint256 endDate = block.timestamp + 31 days;
        uint256 fixedRewardPercentage = 10;

        Structs.Rule[] memory rewardRules = new Structs.Rule[](2);
        rewardRules[0] = Structs.Rule({amount: 100, rewardPercentage: 5});
        rewardRules[1] = Structs.Rule({amount: 200, rewardPercentage: 10});

        // 2. Encode the call data for ProgramFactory.createContracts
        bytes memory callData = abi.encodeWithSelector(
            IProgramFactory.createContracts.selector,
            daoAddress,
            startDate,
            endDate,
            fixedRewardPercentage,
            rewardRules,
            avsSubmitContract,
            0
        );

        // 3. Create a proposal to call ProgramFactory.createContracts
        string memory proposalName = "Create Program and Reward Contracts";
        address targetContract = address(programFactory);
        uint256 durationInDays = 3;

        vm.recordLogs();
        vm.prank(address(this)); // Simulate a DAO member creating the proposal
        daoContract.createProposal(
            proposalName,
            targetContract,
            callData,
            durationInDays
        );

        uint256 proposalId = daoContract.getProposalCount() - 1;

        // 4. Vote on the proposal (simulate voting)

        vm.prank(address(this)); // Simulate a DAO member voting
        daoContract.vote(proposalId, true); // Vote in favor
        vm.prank(address(alice)); // Simulate a DAO member voting
        daoContract.vote(proposalId, true); // Vote in favor
        vm.prank(address(bob)); // Simulate a DAO member voting
        daoContract.vote(proposalId, true); // Vote in favor

        //Fast forward to pass end date
        vm.warp(block.timestamp + 4 days);
        //Execute
        vm.prank(address(this)); //onlyOwner
        daoContract.executeProposal(proposalId);

        // 5. Verify the program and reward contracts were created
        // Get the ProgramCreated event and extract the contract addresses
        (
            address programContractAddress,
            address rewardContractAddress
        ) = getProgramCreatedAddresses();

        Program programContract = Program(programContractAddress);
        Reward rewardContract = Reward(payable(rewardContractAddress));

        // Assert parameters
        assertEq(
            programContract.daoAddress(),
            address(daoContract),
            "DAO address mismatch"
        );
        assertEq(
            rewardContract.programContractAddress(),
            programContractAddress,
            "Program contract address mismatch"
        );
        assertEq(
            rewardContract.avsSubmitContractAddress(),
            avsSubmitContract,
            "Avs contract address mismatch"
        );
    }

    function testSendFundViaDAO() public {
        bytes memory callData = abi.encodeWithSelector(
            ITreasury.sendFund.selector,
            address(0),
            alice,
            0.001 ether
        );

        // 3. Create a proposal to call ProgramFactory.createContracts
        string memory proposalName = "Create send fund Contracts";
        address targetContract = address(treasuryContract);
        uint256 durationInDays = 3;

        vm.recordLogs();
        vm.prank(address(this)); // Simulate a DAO member creating the proposal
        daoContract.createProposal(
            proposalName,
            targetContract,
            callData,
            durationInDays
        );

        uint256 proposalId = daoContract.getProposalCount() - 1;

        // 4. Vote on the proposal (simulate voting)

        vm.prank(address(this)); // Simulate a DAO member voting
        daoContract.vote(proposalId, true); // Vote in favor
        vm.prank(address(alice)); // Simulate a DAO member voting
        daoContract.vote(proposalId, true); // Vote in favor
        vm.prank(address(bob)); // Simulate a DAO member voting
        daoContract.vote(proposalId, true); // Vote in favor

        //Fast forward to pass end date
        vm.warp(block.timestamp + 4 days);
        //Execute
        vm.prank(address(this));
        uint256 oldAliceBalance = alice.balance;
        daoContract.executeProposal(proposalId);
        uint256 newAliceBalance = alice.balance;

        // 5. Verify the program and reward contracts were created
        assertEq(newAliceBalance, oldAliceBalance + 0.001 ether);
    }

    function testApproveAppViaDAO() public {


        vm.recordLogs();

        // 1. create Program & Reward Contract

        uint256 startDate = block.timestamp + 1 days;
        uint256 endDate = block.timestamp + 31 days;
        uint256 fixedRewardPercentage = 10;

        Structs.Rule[] memory rewardRules = new Structs.Rule[](2);
        rewardRules[0] = Structs.Rule({amount: 100, rewardPercentage: 5});
        rewardRules[1] = Structs.Rule({amount: 200, rewardPercentage: 10});

        // DAOContract address is Program contract owner
        vm.prank(address(daoContract));
        programFactory.createContracts(
            address(daoContract), 
            startDate, 
            endDate, 
            fixedRewardPercentage,
            rewardRules, 
            avsSubmitContract,
            0
        );

        (
            address programContractAddress,
            
        ) = getProgramCreatedAddresses();

        // 2. Encode data
        Program programContract = Program(programContractAddress);
        console.log("address(daoContract):", address(daoContract));
        console.log("Owner:", programContract.owner());
        // 2. Create a whitelistedApp proposal
        Structs.App memory app = Structs.App({
            name: "payment app",
            website: "https://google.com",
            xAccount: "@levia2n",
            beneficiaryApp: alice
        });

        address[] memory whitelistedContracts = new address[](2);
        whitelistedContracts[0] = address(0x6);
        whitelistedContracts[1] = address(0x7);
        bytes memory callData = abi.encodeWithSelector(
            IProgram.addWhitelistedApp.selector,
            app,
            whitelistedContracts
        );

        // 3. Create a proposal to call ProgramFactory.createContracts
        string memory proposalName = "Add a whitelisted app";
        address targetContract = programContractAddress;
        uint256 durationInDays = 3;

        vm.prank(address(this)); // Simulate a DAO member creating the proposal
        daoContract.createProposal(
            proposalName,
            targetContract,
            callData,
            durationInDays
        );

        uint256 proposalId = daoContract.getProposalCount() - 1;

        // 4. Vote on the proposal (simulate voting)

        vm.prank(address(this)); // Simulate a DAO member voting
        daoContract.vote(proposalId, true); // Vote in favor
        vm.prank(address(alice)); // Simulate a DAO member voting
        daoContract.vote(proposalId, true); // Vote in favor
        vm.prank(address(bob)); // Simulate a DAO member voting
        daoContract.vote(proposalId, true); // Vote in favor

        //Fast forward to pass end date
        vm.warp(block.timestamp + 4 days);
        //Execute
        vm.prank(address(this));
   
        daoContract.executeProposal(proposalId);

        
        
        (string memory name, string memory website, string memory xAccount, address beneficiaryApp) = programContract.apps(0);

        // 5. Verify the program and reward contracts were created
        assertEq(name, "payment app");
        assertEq(website, "https://google.com");
        assertEq(xAccount, "@levia2n");
        assertEq(beneficiaryApp, alice);
    }

    function getProgramCreatedAddresses()
        internal
        returns (address programContract, address rewardContract)
    {
        // Get the emitted event
        Vm.Log[] memory logs = vm.getRecordedLogs();

        for (uint256 i = 0; i < logs.length; i++) {
            if (
                logs[i].topics[0] ==
                keccak256("ProgramCreated(address,address)")
            ) {
                (programContract, rewardContract) = abi.decode(
                    logs[i].data,
                    (address, address)
                );
                break;
            }
        }
    }
}
