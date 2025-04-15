// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DAOFactory} from "../src/dao/DAOFactory.sol";
import {ProgramFactory} from "../src/program/ProgramFactory.sol";

contract DeployScript is Script {
    DAOFactory public daoFactory;
    ProgramFactory public programFactory;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        daoFactory = new DAOFactory();
        programFactory = new ProgramFactory();

        vm.stopBroadcast();
    }
}
