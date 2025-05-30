// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "./Program.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../src/IReward.sol";

/**
 * @title Reward
 * @author a2nfinance
 * @notice This contract manages the reward distribution for different applications based on the ProgramContract.
 */
contract Reward is ReentrancyGuard, IReward {
    // Program Contract Address
    address public programContractAddress;

    // AVS Submit Contract Address
    address public avsSubmitContractAddress;

    // Allow Claim Flag
    bool public allowClaim;

    // Reward App: appId -> rewardAmount
    mapping(uint256 => uint256) public rewardApp;


    /**
     * @dev Initializes the Reward contract.
     * @param _owner The owner address.
     * @param _programContractAddress The address of the ProgramContract.
     * @param _avsSubmitContractAddress The address of the AVS Submit Contract.
     */
    constructor(
        address _owner,
        address _programContractAddress, 
        address _avsSubmitContractAddress
    ) {
        require(_owner != address(0), "Owner address cannot be zero.");
        require(_programContractAddress != address(0), "Program contract address cannot be zero.");
        require(_avsSubmitContractAddress != address(0), "AVS Submit contract address cannot be zero.");

        programContractAddress = _programContractAddress;
        avsSubmitContractAddress = _avsSubmitContractAddress;
        allowClaim = false;
    }

    /**
     * @inheritdoc IReward
     */
    function claim(uint256 _appId) external nonReentrant {
        // require(allowClaim, "Claiming is not allowed at the moment.");
        // require(rewardApp[_appId] > 0, "No rewards available for this app.");

        // Program program = Program(programContractAddress);
        // require(program.isAppWhitelisted(_appId), "App is not whitelisted for this app.");

        // address beneficiary = program.beneficiaryApp(_appId);
        // require(beneficiary != address(0), "Beneficiary address not set for this app.");

        // uint256 generatedFee = rewardApp[_appId];
        // uint256 rewardType = program.rewardType();
        // uint256 rewardAmount = 0;

        // Structs.Rule[] memory rules = program.getRewardRules();

        // if (rewardType == 0) {
        //     rewardAmount = generatedFee * program.fixedRewardPercentage() / 100;
        // } else {
            
        //     for(uint256 i = 0; i < rules.length; i++) {
        //         if (generatedFee >= rules[i].amount) {
        //             rewardAmount = generatedFee * rules[i].rewardPercentage / 100;
        //         }
        //     }
        // }
        
        // // Reset reward for this app
        // rewardApp[_appId] = 0;

        // // Transfer reward to beneficiary
        // (bool success, ) = beneficiary.call{value: rewardAmount}("");
        // require(success, "Transfer failed.");

        // emit Claimed(_appId, msg.sender, rewardAmount);
    }

    /**
     * @inheritdoc IReward
     */
    function setAllowClaim(bool _allowClaim) external {
        allowClaim = _allowClaim;

        emit AllowClaimUpdated(_allowClaim);
    }

    /**
     * @inheritdoc IReward
     */
    function updateReward(uint256[] memory _appIds, uint256[] memory _additionalRewards) external {
        require(msg.sender == avsSubmitContractAddress, "Only the AVS Submit Contract can call this function.");
        require(_appIds.length == _additionalRewards.length, "Arrays must have the same length.");

        for (uint256 i = 0; i < _appIds.length; i++) {
            rewardApp[_appIds[i]] += _additionalRewards[i];
            emit RewardUpdated(_appIds[i], _additionalRewards[i]);
        }
    }

    /**
     * @inheritdoc IReward
     */
    function updateProgramContractAddress(address _newProgramContractAddress) external {
        require(_newProgramContractAddress != address(0), "Program contract address cannot be zero.");
        programContractAddress = _newProgramContractAddress;
    }

    /**
     * @inheritdoc IReward
     */
    function updateAvsSubmitContractAddress(address _newAvsSubmitContractAddress) external {
        require(_newAvsSubmitContractAddress != address(0), "AVS Submit contract address cannot be zero.");
        avsSubmitContractAddress = _newAvsSubmitContractAddress;
    }

    receive() external payable {
    }
    fallback() external payable {
    }
}