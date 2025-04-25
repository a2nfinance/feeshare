// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IReward {

    /**
     * @dev Allows users to claim rewards for a specific application.
     * @param _appId The ID of the application.
     */
    function claim(uint256 _appId) external;


    /**
     * @dev Sets the allowClaim flag. Only the owner can call this function.
     * @param _allowClaim The new value for the allowClaim flag.
     */
    function setAllowClaim(bool _allowClaim) external;



    /**
     * @dev Updates the reward amount for multiple applications. Only the AVS Submit Contract can call this function.
     * @param _appIds An array of application IDs.
     * @param _additionalRewards An array of additional rewards to be added.
     */
    function updateReward(uint256[] memory _appIds, uint256[] memory _additionalRewards) external;


    /**
     * @dev Updates the program contract address. Only the owner can call this function.
     * @param _newProgramContractAddress The new address of the ProgramContract.
     */
    function updateProgramContractAddress(address _newProgramContractAddress) external;



    /**
     * @dev Updates the AVS Submit contract address. Only the owner can call this function.
     * @param _newAvsSubmitContractAddress The new address of the AVS Submit Contract.
     */
    function updateAvsSubmitContractAddress(address _newAvsSubmitContractAddress) external;

    /**
    * @dev Get reward and generated fee for apps
    * @param _appIds whitelisted application Ids
    * @return Returns generated fee and rewards 
    */
    function getAppRewardReport(uint256[] memory _appIds) external view returns (uint256, uint256);

    // Events
    event Claimed(uint256 appId, address claimant, uint256 amount);
    event AllowClaimUpdated(bool allowClaim);
    event RewardUpdated(uint256 appId, uint256 additionalReward);
}