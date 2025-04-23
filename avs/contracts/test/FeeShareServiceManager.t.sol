// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {FeeShareServiceManager} from "../src/FeeShareServiceManager.sol";
import {MockAVSDeployer} from "@eigenlayer-middleware/test/utils/MockAVSDeployer.sol";
import {ECDSAStakeRegistry} from "@eigenlayer-middleware/src/unaudited/ECDSAStakeRegistry.sol";
import {Vm} from "forge-std/Vm.sol";
import {console2} from "forge-std/Test.sol";
import {FeeShareDeploymentLib} from "../script/utils/FeeShareDeploymentLib.sol";
import {CoreDeployLib, CoreDeploymentParsingLib} from "../script/utils/CoreDeploymentParsingLib.sol";
import {UpgradeableProxyLib} from "../script/utils/UpgradeableProxyLib.sol";
import {ERC20Mock} from "./ERC20Mock.sol";
import {Reward} from "./RewardMock.sol";
import {IERC20, StrategyFactory} from "@eigenlayer/contracts/strategies/StrategyFactory.sol";

import {IECDSAStakeRegistryTypes, IStrategy} from "@eigenlayer-middleware/src/interfaces/IECDSAStakeRegistry.sol";
import {IStrategyManager} from "@eigenlayer/contracts/interfaces/IStrategyManager.sol";
import {IDelegationManager, IDelegationManagerTypes} from "@eigenlayer/contracts/interfaces/IDelegationManager.sol";
import {DelegationManager} from "@eigenlayer/contracts/core/DelegationManager.sol";
import {StrategyManager} from "@eigenlayer/contracts/core/StrategyManager.sol";
import {ISignatureUtilsMixinTypes} from "@eigenlayer/contracts/interfaces/ISignatureUtilsMixin.sol";
import {AVSDirectory} from "@eigenlayer/contracts/core/AVSDirectory.sol";
import {IAVSDirectoryTypes} from "@eigenlayer/contracts/interfaces/IAVSDirectory.sol";
import {Test, console2 as console} from "forge-std/Test.sol";
import {IFeeShareServiceManager} from "../src/IFeeShareServiceManager.sol";
import {ECDSAUpgradeable} from "@openzeppelin-upgrades/contracts/utils/cryptography/ECDSAUpgradeable.sol";

contract FeeShareTaskManagerSetup is Test {
    // used for `toEthSignedMessageHash`
    using ECDSAUpgradeable for bytes32;

    IECDSAStakeRegistryTypes.Quorum internal quorum;

    struct Operator {
        Vm.Wallet key;
        Vm.Wallet signingKey;
    }

    struct TrafficGenerator {
        Vm.Wallet key;
    }

    struct AVSOwner {
        Vm.Wallet key;
    }

    Operator[] internal operators;
    TrafficGenerator internal generator;
    AVSOwner internal owner;

    FeeShareDeploymentLib.DeploymentData internal feeShareDeployment;
    CoreDeployLib.DeploymentData internal coreDeployment;
    CoreDeployLib.DeploymentConfigData coreConfigData;

    address proxyAdmin;

    ERC20Mock public mockToken;

    mapping(address => IStrategy) public tokenToStrategy;

    function setUp() public virtual {
        generator = TrafficGenerator({
            key: vm.createWallet("generator_wallet")
        });
        owner = AVSOwner({key: vm.createWallet("owner_wallet")});

        proxyAdmin = UpgradeableProxyLib.deployProxyAdmin();

        coreConfigData = CoreDeploymentParsingLib.readDeploymentConfigValues(
            "test/mockData/config/core/",
            1337
        );
        coreDeployment = CoreDeployLib.deployContracts(
            proxyAdmin,
            coreConfigData
        );

        vm.prank(coreConfigData.strategyManager.initialOwner);
        StrategyManager(coreDeployment.strategyManager).setStrategyWhitelister(
            coreDeployment.strategyFactory
        );

        mockToken = new ERC20Mock();

        IStrategy strategy = addStrategy(address(mockToken));
        quorum.strategies.push(
            IECDSAStakeRegistryTypes.StrategyParams({
                strategy: strategy,
                multiplier: 10_000
            })
        );

        feeShareDeployment = FeeShareDeploymentLib.deployContracts(
            proxyAdmin,
            coreDeployment,
            quorum,
            owner.key.addr,
            owner.key.addr
        );
        feeShareDeployment.strategy = address(strategy);
        feeShareDeployment.token = address(mockToken);
        labelContracts(coreDeployment, feeShareDeployment);
    }

    function addStrategy(address token) public returns (IStrategy) {
        if (tokenToStrategy[token] != IStrategy(address(0))) {
            return tokenToStrategy[token];
        }

        StrategyFactory strategyFactory = StrategyFactory(
            coreDeployment.strategyFactory
        );
        IStrategy newStrategy = strategyFactory.deployNewStrategy(
            IERC20(token)
        );
        tokenToStrategy[token] = newStrategy;
        return newStrategy;
    }

    function labelContracts(
        CoreDeployLib.DeploymentData memory _coreDeployment,
        FeeShareDeploymentLib.DeploymentData memory _feeShareDeployment
    ) internal {
        vm.label(_coreDeployment.delegationManager, "DelegationManager");
        vm.label(_coreDeployment.avsDirectory, "AVSDirectory");
        vm.label(_coreDeployment.strategyManager, "StrategyManager");
        vm.label(_coreDeployment.eigenPodManager, "EigenPodManager");
        vm.label(_coreDeployment.rewardsCoordinator, "RewardsCoordinator");
        vm.label(_coreDeployment.eigenPodBeacon, "EigenPodBeacon");
        vm.label(_coreDeployment.pauserRegistry, "PauserRegistry");
        vm.label(_coreDeployment.strategyFactory, "StrategyFactory");
        vm.label(_coreDeployment.strategyBeacon, "StrategyBeacon");
        vm.label(
            _feeShareDeployment.feeShareServiceManager,
            "FeeShareServiceManager"
        );
        vm.label(_feeShareDeployment.stakeRegistry, "StakeRegistry");
    }

    function signWithOperatorKey(
        Operator memory operator,
        bytes32 digest
    ) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            operator.key.privateKey,
            digest
        );
        return abi.encodePacked(r, s, v);
    }

    function signWithSigningKey(
        Operator memory operator,
        bytes32 digest
    ) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            operator.signingKey.privateKey,
            digest
        );
        return abi.encodePacked(r, s, v);
    }

    function mintMockTokens(Operator memory operator, uint256 amount) internal {
        mockToken.mint(operator.key.addr, amount);
    }

    function depositTokenIntoStrategy(
        Operator memory operator,
        address token,
        uint256 amount
    ) internal returns (uint256) {
        IStrategy strategy = IStrategy(tokenToStrategy[token]);
        require(address(strategy) != address(0), "Strategy was not found");
        IStrategyManager strategyManager = IStrategyManager(
            coreDeployment.strategyManager
        );

        vm.startPrank(operator.key.addr);
        mockToken.approve(address(strategyManager), amount);
        uint256 shares = strategyManager.depositIntoStrategy(
            strategy,
            IERC20(token),
            amount
        );
        vm.stopPrank();

        return shares;
    }

    function registerAsOperator(Operator memory operator) internal {
        IDelegationManager delegationManager = IDelegationManager(
            coreDeployment.delegationManager
        );

        vm.prank(operator.key.addr);
        delegationManager.registerAsOperator(address(0), 0, "");
    }

    function registerOperatorToAVS(Operator memory operator) internal {
        ECDSAStakeRegistry stakeRegistry = ECDSAStakeRegistry(
            feeShareDeployment.stakeRegistry
        );
        AVSDirectory avsDirectory = AVSDirectory(coreDeployment.avsDirectory);

        bytes32 salt = keccak256(
            abi.encodePacked(block.timestamp, operator.key.addr)
        );
        uint256 expiry = block.timestamp + 1 hours;

        bytes32 operatorRegistrationDigestHash = avsDirectory
            .calculateOperatorAVSRegistrationDigestHash(
                operator.key.addr,
                address(feeShareDeployment.feeShareServiceManager),
                salt,
                expiry
            );

        bytes memory signature = signWithOperatorKey(
            operator,
            operatorRegistrationDigestHash
        );

        ISignatureUtilsMixinTypes.SignatureWithSaltAndExpiry
            memory operatorSignature = ISignatureUtilsMixinTypes
                .SignatureWithSaltAndExpiry({
                    signature: signature,
                    salt: salt,
                    expiry: expiry
                });

        vm.prank(address(operator.key.addr));
        stakeRegistry.registerOperatorWithSignature(
            operatorSignature,
            operator.signingKey.addr
        );
    }

    function deregisterOperatorFromAVS(Operator memory operator) internal {
        ECDSAStakeRegistry stakeRegistry = ECDSAStakeRegistry(
            feeShareDeployment.stakeRegistry
        );

        vm.prank(operator.key.addr);
        stakeRegistry.deregisterOperator();
    }

    function createAndAddOperator() internal returns (Operator memory) {
        Vm.Wallet memory operatorKey = vm.createWallet(
            string.concat("operator", vm.toString(operators.length))
        );
        Vm.Wallet memory signingKey = vm.createWallet(
            string.concat("signing", vm.toString(operators.length))
        );

        Operator memory newOperator = Operator({
            key: operatorKey,
            signingKey: signingKey
        });

        operators.push(newOperator);
        return newOperator;
    }

    function updateOperatorWeights(Operator[] memory _operators) internal {
        ECDSAStakeRegistry stakeRegistry = ECDSAStakeRegistry(
            feeShareDeployment.stakeRegistry
        );

        address[] memory operatorAddresses = new address[](_operators.length);
        for (uint256 i = 0; i < _operators.length; i++) {
            operatorAddresses[i] = _operators[i].key.addr;
        }

        stakeRegistry.updateOperators(operatorAddresses);
    }

    function getOperators(
        uint256 numOperators
    ) internal view returns (Operator[] memory) {
        require(numOperators <= operators.length, "Not enough operators");

        Operator[] memory operatorsMem = new Operator[](numOperators);
        for (uint256 i = 0; i < numOperators; i++) {
            operatorsMem[i] = operators[i];
        }
        // Sort the operators by address
        for (uint256 i = 0; i < numOperators - 1; i++) {
            uint256 minIndex = i;
            // Find the minimum operator by address
            for (uint256 j = i + 1; j < numOperators; j++) {
                if (
                    operatorsMem[minIndex].key.addr > operatorsMem[j].key.addr
                ) {
                    minIndex = j;
                }
            }
            // Swap the minimum operator with the ith operator
            Operator memory temp = operatorsMem[i];
            operatorsMem[i] = operatorsMem[minIndex];
            operatorsMem[minIndex] = temp;
        }
        return operatorsMem;
    }

    function createTask(
        address rewardContractAddress,
        uint256[] memory appIds,
        uint32 fromBlockNum,
        uint32 toBlockNum
    )
        internal
        returns (IFeeShareServiceManager.Task memory task, uint32 taskIndex)
    {
        IFeeShareServiceManager feeShareServiceManager = IFeeShareServiceManager(
                feeShareDeployment.feeShareServiceManager
            );

        vm.prank(generator.key.addr);
        taskIndex = feeShareServiceManager.latestTaskNum();
        task = feeShareServiceManager.createNewTask(rewardContractAddress, appIds, fromBlockNum, toBlockNum);
        return (task, taskIndex);
    }

    function respondToTask(
        Operator[] memory operatorsMem,
        IFeeShareServiceManager.Task memory task,
        IFeeShareServiceManager.TaskResponse memory taskResponse
    ) internal {
        bytes memory signedResponse = makeTaskResponse(
            operatorsMem,
            task,
            taskResponse
        );

        IFeeShareServiceManager(feeShareDeployment.feeShareServiceManager)
            .respondToTask(
                task,
                taskResponse,
                signedResponse
            );
    }

    function makeTaskResponse(
        Operator[] memory operatorsMem,
        IFeeShareServiceManager.Task memory task,
        IFeeShareServiceManager.TaskResponse memory taskResponse
    ) internal pure returns (bytes memory) {
        bytes32 messageHash = keccak256(abi.encode(taskResponse));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        address[] memory operatorAddrs = new address[](operatorsMem.length);
        for (uint256 i = 0; i < operatorsMem.length; i++) {
            operatorAddrs[i] = operatorsMem[i].key.addr;
        }
        bytes[] memory signatures = new bytes[](operatorsMem.length);
        for (uint256 i = 0; i < operatorsMem.length; i++) {
            signatures[i] = signWithSigningKey(
                operatorsMem[i],
                ethSignedMessageHash
            );
        }

        bytes memory signedTask = abi.encode(
            operatorAddrs,
            signatures,
            task.taskCreatedBlock
        );

        return signedTask;
    }

    function slashOperator(
        IFeeShareServiceManager.Task memory task,
        uint32 referenceTaskIndex,
        address operator
    ) internal {
        IFeeShareServiceManager(feeShareDeployment.feeShareServiceManager)
            .slashOperator(task, referenceTaskIndex, operator);
    }
}

contract FeeShareServiceManagerInitialization is FeeShareTaskManagerSetup {
    function testInitialization() public view {
        ECDSAStakeRegistry stakeRegistry = ECDSAStakeRegistry(
            feeShareDeployment.stakeRegistry
        );

        IECDSAStakeRegistryTypes.Quorum memory quorum = stakeRegistry.quorum();

        assertGt(quorum.strategies.length, 0, "No strategies in quorum");
        assertEq(
            address(quorum.strategies[0].strategy),
            address(tokenToStrategy[address(mockToken)]),
            "First strategy doesn't match mock token strategy"
        );

        assertTrue(
            feeShareDeployment.stakeRegistry != address(0),
            "StakeRegistry not deployed"
        );
        assertTrue(
            feeShareDeployment.feeShareServiceManager != address(0),
            "FeeShareServiceManager not deployed"
        );
        assertTrue(
            coreDeployment.delegationManager != address(0),
            "DelegationManager not deployed"
        );
        assertTrue(
            coreDeployment.avsDirectory != address(0),
            "AVSDirectory not deployed"
        );
        assertTrue(
            coreDeployment.strategyManager != address(0),
            "StrategyManager not deployed"
        );
        assertTrue(
            coreDeployment.eigenPodManager != address(0),
            "EigenPodManager not deployed"
        );
        assertTrue(
            coreDeployment.strategyFactory != address(0),
            "StrategyFactory not deployed"
        );
        assertTrue(
            coreDeployment.strategyBeacon != address(0),
            "StrategyBeacon not deployed"
        );
    }
}

contract RegisterOperator is FeeShareTaskManagerSetup {
    uint256 internal constant INITIAL_BALANCE = 100 ether;
    uint256 internal constant DEPOSIT_AMOUNT = 1 ether;
    uint256 internal constant OPERATOR_COUNT = 4;

    DelegationManager internal delegationManager;
    AVSDirectory internal avsDirectory;
    IFeeShareServiceManager internal sm;
    ECDSAStakeRegistry internal stakeRegistry;

    function setUp() public virtual override {
        super.setUp();
        /// Setting to internal state for convenience
        delegationManager = DelegationManager(coreDeployment.delegationManager);
        avsDirectory = AVSDirectory(coreDeployment.avsDirectory);
        sm = IFeeShareServiceManager(feeShareDeployment.feeShareServiceManager);
        stakeRegistry = ECDSAStakeRegistry(feeShareDeployment.stakeRegistry);

        addStrategy(address(mockToken));

        while (operators.length < OPERATOR_COUNT) {
            createAndAddOperator();
        }

        for (uint256 i = 0; i < OPERATOR_COUNT; i++) {
            mintMockTokens(operators[i], INITIAL_BALANCE);

            depositTokenIntoStrategy(
                operators[i],
                address(mockToken),
                DEPOSIT_AMOUNT
            );

            registerAsOperator(operators[i]);
        }
    }

    function testVerifyOperatorStates() public view {
        for (uint256 i = 0; i < OPERATOR_COUNT; i++) {
            address operatorAddr = operators[i].key.addr;

            uint256 operatorShares = delegationManager.operatorShares(
                operatorAddr,
                tokenToStrategy[address(mockToken)]
            );
            assertEq(
                operatorShares,
                DEPOSIT_AMOUNT,
                "Operator shares in DelegationManager incorrect"
            );
        }
    }

    function test_RegisterOperatorToAVS() public {
        address operatorAddr = operators[0].key.addr;
        registerOperatorToAVS(operators[0]);
        assertTrue(
            avsDirectory.avsOperatorStatus(address(sm), operatorAddr) ==
                IAVSDirectoryTypes.OperatorAVSRegistrationStatus.REGISTERED,
            "Operator not registered in AVSDirectory"
        );

        address signingKey = stakeRegistry.getLatestOperatorSigningKey(
            operatorAddr
        );
        assertTrue(
            signingKey != address(0),
            "Operator signing key not set in ECDSAStakeRegistry"
        );

        uint256 operatorWeight = stakeRegistry.getLastCheckpointOperatorWeight(
            operatorAddr
        );
        assertTrue(
            operatorWeight > 0,
            "Operator weight not set in ECDSAStakeRegistry"
        );
    }
}

contract CreateTask is FeeShareTaskManagerSetup {
    IFeeShareServiceManager internal sm;

    function setUp() public override {
        super.setUp();
        sm = IFeeShareServiceManager(feeShareDeployment.feeShareServiceManager);
    }

    function testCreateTask() public {
        address rewardContractAddress = address(0x5);
        uint256[] memory appIds = new uint256[](2);
        appIds[0] = 1;
        appIds[1] = 2;
        uint32 fromBlockNum = 1;
        uint32 toBlockNum = 2;

        vm.prank(generator.key.addr);
        IFeeShareServiceManager.Task memory newTask = sm.createNewTask({
            rewardContractAddress: rewardContractAddress,
            appIds: appIds,
            fromBlockNum: fromBlockNum,
            toBlockNum: toBlockNum
        });

        require(
            sha256(abi.encodePacked(newTask.fromBlockNum)) ==
                sha256(abi.encodePacked(fromBlockNum)),
            "FromBlockNum not set correctly"
        );
        require(
            newTask.taskCreatedBlock == uint32(block.number),
            "Task created block not set correctly"
        );
    }
}

contract RespondToTask is FeeShareTaskManagerSetup {
    uint256 internal constant INITIAL_BALANCE = 100 ether;
    uint256 internal constant DEPOSIT_AMOUNT = 1 ether;
    uint256 internal constant OPERATOR_COUNT = 4;

    IDelegationManager internal delegationManager;
    AVSDirectory internal avsDirectory;
    IFeeShareServiceManager internal sm;
    ECDSAStakeRegistry internal stakeRegistry;

    function setUp() public override {
        super.setUp();

        delegationManager = IDelegationManager(
            coreDeployment.delegationManager
        );
        avsDirectory = AVSDirectory(coreDeployment.avsDirectory);
        sm = IFeeShareServiceManager(feeShareDeployment.feeShareServiceManager);
        stakeRegistry = ECDSAStakeRegistry(feeShareDeployment.stakeRegistry);

        addStrategy(address(mockToken));

        while (operators.length < OPERATOR_COUNT) {
            createAndAddOperator();
        }

        for (uint256 i = 0; i < OPERATOR_COUNT; i++) {
            mintMockTokens(operators[i], INITIAL_BALANCE);

            depositTokenIntoStrategy(
                operators[i],
                address(mockToken),
                DEPOSIT_AMOUNT
            );

            registerAsOperator(operators[i]);

            registerOperatorToAVS(operators[i]);
        }
    }

    function testRespondToTask() public {
        address rewardContractAddress = address(0x5);
        Reward reward = new Reward(
            address(0x6),
            address(0x7),
            feeShareDeployment.feeShareServiceManager
        );
        uint256[] memory appIds = new uint256[](2);
        appIds[0] = 1;
        appIds[1] = 2;
        uint32 fromBlockNum = 1;
        uint32 toBlockNum = 2;
        (
            IFeeShareServiceManager.Task memory newTask,
            uint32 taskIndex
        ) = createTask(address(reward), appIds, fromBlockNum, toBlockNum);


        Operator[] memory operatorsMem = getOperators(1);

        IFeeShareServiceManager.TaskResponse memory taskResponse = IFeeShareServiceManager.TaskResponse({
            referenceTaskIndex: taskIndex,
            appIds: appIds,
            additionalRewards: appIds
        });
        bytes memory signedResponse = makeTaskResponse(operatorsMem, newTask, taskResponse);

        vm.roll(block.number + 1);
        sm.respondToTask(newTask, taskResponse, signedResponse);
    }

    // function testRespondToTaskWith2OperatorsAggregatedSignature() public {
    //     address rewardContractAddress = address(0x5);
    //     uint256[] memory appIds = new uint256[](2);
    //     appIds[0] = 1;
    //     appIds[1] = 2;
    //     uint32 fromBlockNum = 1;
    //     uint32 toBlockNum = 2;
    //     (
    //         IFeeShareServiceManager.Task memory newTask,
    //         uint32 taskIndex
    //     ) = createTask(rewardContractAddress, appIds, fromBlockNum, toBlockNum);

    //     // Generate aggregated response with two operators
    //     Operator[] memory operatorsMem = getOperators(2);
    //     IFeeShareServiceManager.TaskResponse memory taskResponse = IFeeShareServiceManager.TaskResponse({
    //         referenceTaskIndex: taskIndex,
    //         appIds: appIds,
    //         additionalRewards: appIds
    //     });
    //     bytes memory signedResponse = makeTaskResponse(operatorsMem, newTask, taskResponse);

    //     vm.roll(block.number + 1);
    //     sm.respondToTask(newTask, taskResponse, signedResponse);
    // }

    // function testRespondToTaskWith3OperatorsAggregatedSignature() public {
    //     address rewardContractAddress = address(0x5);
    //     uint256[] memory appIds = new uint256[](2);
    //     appIds[0] = 1;
    //     appIds[1] = 2;
    //     uint32 fromBlockNum = 1;
    //     uint32 toBlockNum = 2;
    //     (
    //         IFeeShareServiceManager.Task memory newTask,
    //         uint32 taskIndex
    //     ) = createTask(rewardContractAddress, appIds, fromBlockNum, toBlockNum);

    //     // Generate aggregated response with three operators
    //     Operator[] memory operatorsMem = getOperators(3);
    //     IFeeShareServiceManager.TaskResponse memory taskResponse = IFeeShareServiceManager.TaskResponse({
    //         referenceTaskIndex: taskIndex,
    //         appIds: appIds,
    //         additionalRewards: appIds
    //     });
    //     bytes memory signedResponse = makeTaskResponse(operatorsMem, newTask, taskResponse);

    //     vm.roll(block.number + 1);
    //     sm.respondToTask(newTask, taskResponse, signedResponse);
    // }
}

contract SlashOperator is FeeShareTaskManagerSetup {
    uint256 internal constant INITIAL_BALANCE = 100 ether;
    uint256 internal constant DEPOSIT_AMOUNT = 1 ether;
    uint256 internal constant OPERATOR_COUNT = 4;

    IDelegationManager internal delegationManager;
    AVSDirectory internal avsDirectory;
    IFeeShareServiceManager internal sm;
    ECDSAStakeRegistry internal stakeRegistry;

    function setUp() public override {
        super.setUp();

        delegationManager = IDelegationManager(
            coreDeployment.delegationManager
        );
        avsDirectory = AVSDirectory(coreDeployment.avsDirectory);
        sm = IFeeShareServiceManager(feeShareDeployment.feeShareServiceManager);
        stakeRegistry = ECDSAStakeRegistry(feeShareDeployment.stakeRegistry);

        addStrategy(address(mockToken));

        while (operators.length < OPERATOR_COUNT) {
            createAndAddOperator();
        }

        for (uint256 i = 0; i < OPERATOR_COUNT; i++) {
            mintMockTokens(operators[i], INITIAL_BALANCE);

            depositTokenIntoStrategy(
                operators[i],
                address(mockToken),
                DEPOSIT_AMOUNT
            );

            registerAsOperator(operators[i]);

            registerOperatorToAVS(operators[i]);
        }
    }

    function testValidResponseIsNotSlashable() public {
        address rewardContractAddress = address(0x5);
        uint256[] memory appIds = new uint256[](2);
        appIds[0] = 1;
        appIds[1] = 2;
        uint32 fromBlockNum = 1;
        uint32 toBlockNum = 2;
        (
            IFeeShareServiceManager.Task memory newTask,
            uint32 taskIndex
        ) = createTask(rewardContractAddress, appIds, fromBlockNum, toBlockNum);

        Operator[] memory operatorsMem = getOperators(1);

        IFeeShareServiceManager.TaskResponse memory taskResponse = IFeeShareServiceManager.TaskResponse({
            referenceTaskIndex: taskIndex,
            appIds: appIds,
            additionalRewards: appIds
        });
        vm.roll(block.number + 1);
        respondToTask(operatorsMem, newTask, taskResponse);

        vm.expectRevert("Task has already been responded to");
        slashOperator(newTask, taskIndex, operatorsMem[0].key.addr);

        // TODO: check the operator's balance was not reduced
    }

    function testNoResponseIsSlashable() public {
        address rewardContractAddress = address(0x5);
        uint256[] memory appIds = new uint256[](2);
        appIds[0] = 1;
        appIds[1] = 2;
        uint32 fromBlockNum = 1;
        uint32 toBlockNum = 2;
        (
            IFeeShareServiceManager.Task memory newTask,
            uint32 taskIndex
        ) = createTask(rewardContractAddress, appIds, fromBlockNum, toBlockNum);

        Operator[] memory operatorsMem = getOperators(1);

        uint32 maxResponseIntervalBlocks = FeeShareServiceManager(address(sm))
            .MAX_RESPONSE_INTERVAL_BLOCKS();
        vm.roll(block.number + maxResponseIntervalBlocks + 1);

        slashOperator(newTask, taskIndex, operatorsMem[0].key.addr);

        // TODO: check the operator's balance was reduced
    }

    function testMultipleSlashings() public {
        address rewardContractAddress = address(0x5);
        uint256[] memory appIds = new uint256[](2);
        appIds[0] = 1;
        appIds[1] = 2;
        uint32 fromBlockNum = 1;
        uint32 toBlockNum = 2;
        (
            IFeeShareServiceManager.Task memory newTask,
            uint32 taskIndex
        ) = createTask(rewardContractAddress, appIds, fromBlockNum, toBlockNum);

        Operator[] memory operatorsMem = getOperators(3);

        uint32 maxResponseIntervalBlocks = FeeShareServiceManager(address(sm))
            .MAX_RESPONSE_INTERVAL_BLOCKS();
        vm.roll(block.number + maxResponseIntervalBlocks + 1);

        slashOperator(newTask, taskIndex, operatorsMem[0].key.addr);
        slashOperator(newTask, taskIndex, operatorsMem[1].key.addr);
        slashOperator(newTask, taskIndex, operatorsMem[2].key.addr);

        // TODO: check the operator's balance was reduced
    }
}
