// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/Test.sol";
import {FeeShareDeploymentLib} from "./utils/FeeShareDeploymentLib.sol";
import {CoreDeployLib, CoreDeploymentParsingLib} from "./utils/CoreDeploymentParsingLib.sol";
import {UpgradeableProxyLib} from "./utils/UpgradeableProxyLib.sol";
import {StrategyBase} from "@eigenlayer/contracts/strategies/StrategyBase.sol";
import {ERC20Mock} from "../test/ERC20Mock.sol";
import {TransparentUpgradeableProxy} from
    "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import {StrategyFactory} from "@eigenlayer/contracts/strategies/StrategyFactory.sol";
import {StrategyManager} from "@eigenlayer/contracts/core/StrategyManager.sol";
import {IRewardsCoordinator} from "@eigenlayer/contracts/interfaces/IRewardsCoordinator.sol";

import {
    IECDSAStakeRegistryTypes,
    IStrategy
} from "@eigenlayer-middleware/src/interfaces/IECDSAStakeRegistry.sol";

import "forge-std/Test.sol";

contract FeeShareDeployer is Script, Test {
    using CoreDeployLib for *;
    using UpgradeableProxyLib for address;

    address private deployer;
    address proxyAdmin;
    address rewardsOwner;
    address rewardsInitiator;
    IStrategy feeShareStrategy;
    CoreDeployLib.DeploymentData coreDeployment;
    FeeShareDeploymentLib.DeploymentData feeShareDeployment;
    FeeShareDeploymentLib.DeploymentConfigData feeShareConfig;
    IECDSAStakeRegistryTypes.Quorum internal quorum;
    ERC20Mock token;

    function setUp() public virtual {
        deployer = vm.rememberKey(vm.envUint("PRIVATE_KEY"));
        vm.label(deployer, "Deployer");

        feeShareConfig =
            FeeShareDeploymentLib.readDeploymentConfigValues("config/fee-share/", block.chainid);

        coreDeployment =
            CoreDeploymentParsingLib.readDeploymentJson("deployments/core/", block.chainid);
    }

    function run() external {
        vm.startBroadcast(deployer);
        rewardsOwner = feeShareConfig.rewardsOwner;
        rewardsInitiator = feeShareConfig.rewardsInitiator;

        token = new ERC20Mock();
        // NOTE: if this fails, it's because the initialStrategyWhitelister is not set to be the StrategyFactory
        feeShareStrategy =
            IStrategy(StrategyFactory(coreDeployment.strategyFactory).deployNewStrategy(token));

        quorum.strategies.push(
            IECDSAStakeRegistryTypes.StrategyParams({
                strategy: feeShareStrategy,
                multiplier: 10_000
            })
        );

        token.mint(deployer, 2000);
        token.increaseAllowance(address(coreDeployment.strategyManager), 1000);
        StrategyManager(coreDeployment.strategyManager).depositIntoStrategy(
            feeShareStrategy, token, 1000
        );

        proxyAdmin = UpgradeableProxyLib.deployProxyAdmin();

        feeShareDeployment = FeeShareDeploymentLib.deployContracts(
            proxyAdmin, coreDeployment, quorum, rewardsInitiator, rewardsOwner
        );

        feeShareDeployment.strategy = address(feeShareStrategy);
        feeShareDeployment.token = address(token);

        vm.stopBroadcast();
        verifyDeployment();
        FeeShareDeploymentLib.writeDeploymentJson(feeShareDeployment);
    }

    function verifyDeployment() internal view {
        require(
            feeShareDeployment.stakeRegistry != address(0), "StakeRegistry address cannot be zero"
        );
        require(
            feeShareDeployment.feeShareServiceManager != address(0),
            "FeeShareServiceManager address cannot be zero"
        );
        require(feeShareDeployment.strategy != address(0), "Strategy address cannot be zero");
        require(proxyAdmin != address(0), "ProxyAdmin address cannot be zero");
        require(
            coreDeployment.delegationManager != address(0),
            "DelegationManager address cannot be zero"
        );
        require(coreDeployment.avsDirectory != address(0), "AVSDirectory address cannot be zero");
    }
}
