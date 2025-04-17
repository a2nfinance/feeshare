// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/program/ProgramFactory.sol";
import "../src/program/Program.sol";
import "../src/program/Reward.sol";
import "../src/structs/Structs.sol";

contract ProgramFactoryTest is Test {
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
        programFactory = new ProgramFactory();
    }

    function testCreateContracts() public {
        address daoAddress = address(0x5);
        uint256 startDate = block.timestamp;
        uint256 endDate = block.timestamp + 30 days;
        uint256 fixedRewardPercentage = 10;

        //Define reward rules
        Structs.Rule[] memory rewardRules = new Structs.Rule[](2);
        rewardRules[0] = Structs.Rule({amount: 100, rewardPercentage: 5});
        rewardRules[1] = Structs.Rule({amount: 200, rewardPercentage: 10});

        // Start capturing logs
        vm.recordLogs();
        vm.prank(owner);
        programFactory.createContracts(
            daoAddress,
            startDate,
            endDate,
            fixedRewardPercentage,
            rewardRules,
            avsSubmitContract,
            0
        );

        // Get the ProgramCreated event and extract the contract addresses
        (address programContractAddress, address rewardContractAddress) = getProgramCreatedAddresses();

        // Assert that the contracts were created
        assertTrue(programContractAddress != address(0), "Program contract address should not be zero");
        assertTrue(rewardContractAddress != address(0), "Reward contract address should not be zero");

        // Verify that the Program contract has the correct parameters
        Program programContract = Program(programContractAddress);
        assertEq(programContract.daoAddress(), daoAddress, "Program DAO address should be correct");
        assertEq(programContract.startDate(), startDate, "Program start date should be correct");
        assertEq(programContract.endDate(), endDate, "Program end date should be correct");
        assertEq(programContract.fixedRewardPercentage(), fixedRewardPercentage, "Program fixed reward percentage should be correct");

        // Check reward rules
        assertEq(programContract.getRewardRule(0).rewardPercentage,5,"Rule amount 100");
        assertEq(programContract.getRewardRule(1).rewardPercentage,10,"Rule amount 200");

        // Verify that the Reward contract has the correct parameters
        Reward rewardContract = Reward(payable(rewardContractAddress));
        assertEq(rewardContract.programContractAddress(), address(programContract), "Reward Program address should be correct");
        assertEq(rewardContract.avsSubmitContractAddress(), avsSubmitContract, "Reward AVS Submit address should be correct");
    }

    // Helper function to extract the Program and Reward contract addresses from the ProgramCreated event
    function getProgramCreatedAddresses() internal returns (address programContract, address rewardContract) {
        // Get the emitted event
        Vm.Log[] memory logs = vm.getRecordedLogs();

        for (uint256 i = 0; i < logs.length; i++) {
            
            if (logs[i].topics[0] == keccak256("ProgramCreated(address,address)")) {
                // daoContract = address(uint160(uint256(logs[i].topics[1])));
                // treasuryContract = address(uint160(uint256(logs[i].topics[2])));
                (programContract, rewardContract) = abi.decode(logs[i].data, (address, address));
                break;
            }
        }

        console.log("Program Contract: %s, Contract: %s", programContract, rewardContract);
    }


    // function testCreateContracts_RevertsIfNotOwner() public {
    //     address daoAddress = address(0x5);
    //     uint256 startDate = block.timestamp;
    //     uint256 endDate = block.timestamp + 30 days;
    //     uint256 fixedRewardPercentage = 10;

    //     //Define reward rules
    //     Structs.Rule[] memory rewardRules = new Structs.Rule[](2);
    //     rewardRules[0] = Structs.Rule({amount: 100, rewardPercentage: 5});
    //     rewardRules[1] = Structs.Rule({amount: 200, rewardPercentage: 10});

    //     vm.prank(alice);
    //     vm.expectRevert();
    //     programFactory.createContracts(
    //         daoAddress,
    //         startDate,
    //         endDate,
    //         fixedRewardPercentage,
    //         rewardRules,
    //         avsSubmitContract
    //     );
    // }
}