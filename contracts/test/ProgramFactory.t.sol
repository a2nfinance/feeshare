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
    address public daoAddress;
    
    event ProgramCreated(address programContract, address rewardContract);

    function setUp() public {
        owner = address(0x1);
        alice = address(0x2);
        bob = address(0x3);
        avsSubmitContract = address(0x4);
        daoAddress =  address(0x5);
        vm.prank(daoAddress);

        programFactory = new ProgramFactory();
    }

    function testCreateContracts() public {
        uint256 startDate = block.timestamp;
        uint256 endDate = block.timestamp + 30 days;
        uint256 fixedRewardPercentage = 10;

        //Define reward rules
        Structs.Rule[] memory rewardRules = new Structs.Rule[](2);
        rewardRules[0] = Structs.Rule({amount: 0.0001 ether, rewardPercentage: 5});
        rewardRules[1] = Structs.Rule({amount: 0.0005 ether, rewardPercentage: 10});

        // Start capturing logs
        vm.recordLogs();
        vm.prank(daoAddress);
        programFactory.createContracts(
            "Test program",
            daoAddress,
            startDate,
            endDate,
            fixedRewardPercentage,
            rewardRules,
            avsSubmitContract,
            1
        );

        // Get the ProgramCreated event and extract the contract addresses
        (address programContractAddress, address rewardContractAddress) = getProgramCreatedAddresses();

        // Assert that the contracts were created
        assertTrue(programContractAddress != address(0), "Program contract address should not be zero");
        assertTrue(rewardContractAddress != address(0), "Reward contract address should not be zero");

        // Verify that the Program contract has the correct parameters
        vm.prank(daoAddress);
        Program programContract = Program(programContractAddress);
        Structs.App memory app = Structs.App({
            name: "test",
            website: "test",
            xAccount: "test",
            beneficiaryApp: alice
        });

        address[] memory contractAddreses = new address[](2);
        contractAddreses[0] = address(0x7);
        contractAddreses[1] = address(0x8);
        programContract.addWhitelistedApp(app, contractAddreses);

        assertEq(programContract.daoAddress(), daoAddress, "Program DAO address should be correct");
        assertEq(programContract.startDate(), startDate, "Program start date should be correct");
        assertEq(programContract.endDate(), endDate, "Program end date should be correct");
        assertEq(programContract.fixedRewardPercentage(), fixedRewardPercentage, "Program fixed reward percentage should be correct");
        
        // Check reward rules
        assertEq(programContract.getRewardRule(0).rewardPercentage,5,"Rule amount 100");
        assertEq(programContract.getRewardRule(1).rewardPercentage,10,"Rule amount 200");

        // Verify that the Reward contract has the correct parameters
        Reward rewardContract = Reward(payable(rewardContractAddress));
        vm.prank(daoAddress);
        rewardContract.setAllowClaim(true);
        assertEq(rewardContract.programContractAddress(), address(programContract), "Reward Program address should be correct");
        assertEq(rewardContract.avsSubmitContractAddress(), avsSubmitContract, "Reward AVS Submit address should be correct");

        // Fund reward
        vm.deal(owner, 2 ether);
        (bool success, ) = payable(address(rewardContractAddress)).call{
            value: 0.5 ether
        }("");

        require(success, "Failed to send ETH");
        // Update reward
        vm.prank(avsSubmitContract);

        uint256[] memory appIds = new uint256[](1);
        uint256[] memory generatedFees = new uint256[](1);
        appIds[0] = 0;
        generatedFees[0] = 0.0005 ether;
        rewardContract.updateReward(appIds, generatedFees);
        uint256 aliceBalanceBefore = alice.balance;
        vm.prank(alice);
        (uint256 generatedFee, uint256 reward) = rewardContract.getAppRewardReport(appIds);

        assertEq(generatedFee, 0.0005 ether);
        assertEq(reward, 0.00005 ether);

        rewardContract.claim(0);
        uint256 aliceBalanceAfter = alice.balance;
        assertEq(aliceBalanceBefore, aliceBalanceAfter - 0.00005 ether);
        console.log("Alice Balance After:", aliceBalanceAfter);
        console.log("Alice Balance Before:", aliceBalanceBefore);

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