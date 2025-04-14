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

        vm.prank(owner);

        // Deploy DAO and Treasury contracts directly
        daoContract = new StandardDAO(
            owner,
            "My DAO",
            "A test DAO",
            "MyDAO_X",
            "MyDAO_Discord",
            50*100,  // Quorum
            60*100,  // Voting Threshold
            true,  // Only Members Can Propose
            false // Only Members Can Propose
        );

        console.log(daoContract.owner());

        treasuryContract = new Treasury(
            owner,
            address(daoContract),
            new address[](0), // No initial whitelisted tokens
            new address[](0)  // No initial whitelisted funders
        );
        programFactory = new ProgramFactory();
        vm.prank(owner);
        daoContract.addMember(address(this), 1);
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
            // "createContracts(address,uint256,uint256,uint256,Structs.Rule[],address)",
            IProgramFactory.createContracts.selector,
            daoAddress,
            startDate,
            endDate,
            fixedRewardPercentage,
            rewardRules,
            avsSubmitContract
        );

        // 3. Create a proposal to call ProgramFactory.createContracts
        string memory proposalName = "Create Program and Reward Contracts";
        address targetContract = address(programFactory);
        uint256 durationInDays = 3;

        vm.recordLogs();
        vm.prank(address(this));  // Simulate a DAO member creating the proposal
        daoContract.createProposal(
            proposalName,
            targetContract,
            callData,
            durationInDays
        );

        uint256 proposalId = daoContract.getProposalCount() - 1;

        // 4. Vote on the proposal (simulate voting)

        vm.prank(address(this));  // Simulate a DAO member voting
        daoContract.vote(proposalId, true);  // Vote in favor

        //Fast forward to pass end date
        vm.warp(block.timestamp + 4 days);
        //Execute
        vm.prank(address(this)); //onlyOwner
        daoContract.executeProposal(proposalId);


        // 5. Verify the program and reward contracts were created
        // Get the ProgramCreated event and extract the contract addresses
        (address programContractAddress, address rewardContractAddress) = getProgramCreatedAddresses();

        Program programContract = Program(programContractAddress);
        Reward rewardContract = Reward(rewardContractAddress);

        // Assert parameters
        assertEq(programContract.daoAddress(), address(daoContract), "DAO address mismatch");
        assertEq(rewardContract.programContractAddress(), programContractAddress, "Program contract address mismatch");
        assertEq(rewardContract.avsSubmitContractAddress(), avsSubmitContract, "Avs contract address mismatch");
    }

    function getProgramCreatedAddresses() internal returns (address programContract, address rewardContract) {
        // Get the emitted event
        Vm.Log[] memory logs = vm.getRecordedLogs();

        for (uint256 i = 0; i < logs.length; i++) {
            
            if (logs[i].topics[0] == keccak256("ProgramCreated(address,address)")) {
                (programContract, rewardContract) = abi.decode(logs[i].data, (address, address));
                break;
            }
        }
    }
}