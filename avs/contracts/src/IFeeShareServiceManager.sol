// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IFeeShareServiceManager {
    event NewTaskCreated(uint32 indexed taskIndex, Task task);

    event TaskResponded(uint32 indexed taskIndex, Task task, address operator);

    struct Task {
        address rewardContractAddress;
        uint256[] appIds;
        uint32 fromBlockNum;
        uint32 toBlockNum;
        uint32 taskCreatedBlock;
    }


    // Task response is hashed and signed by operators.
    // these signatures are aggregated and sent to the contract as response.
    struct TaskResponse {
        // Can be obtained by the operator from the event NewTaskCreated.
        uint32 referenceTaskIndex;
        uint256[] appIds;
        uint256[] additionalRewards;
    }

    function latestTaskNum() external view returns (uint32);

    function allTaskHashes(
        uint32 taskIndex
    ) external view returns (bytes32);

    function allTaskResponses(
        address operator,
        uint32 taskIndex
    ) external view returns (bytes memory);

    function createNewTask(
        address rewardContractAddress,
        uint256[] memory appIds,
        uint32 fromBlockNum,
        uint32 toBlockNum
    ) external returns (Task memory);

    function respondToTask(
        Task calldata task,
        TaskResponse calldata taskResponse,
        bytes memory signature
    ) external;

    function slashOperator(
        Task calldata task,
        uint32 referenceTaskIndex,
        address operator
    ) external;
}
