// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DAOFactory} from "../src/dao/DAOFactory.sol";
import {ProgramFactory} from "../src/program/ProgramFactory.sol";

contract DeployScript is Script {
    DAOFactory public daoFactory;
    ProgramFactory public programFactory;
    
    address private deployer;

    function setUp() public {
        deployer = vm.rememberKey(vm.envUint("PRIVATE_KEY"));
        vm.label(deployer, "Deployer");

    }

    function run() public {
        vm.startBroadcast(deployer);

        daoFactory = new DAOFactory();
        programFactory = new ProgramFactory();

        vm.stopBroadcast();
    }
}
