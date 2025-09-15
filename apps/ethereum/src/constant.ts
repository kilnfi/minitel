import { erc20Abi, erc4626Abi, parseAbi } from 'viem';
import { CCTP_MESSAGE_TRANSMITTER_ABI } from '@/abi/CCTP_MESSAGE_TRANSMITTER_ABI';
import { ETH_BEACON_DEPOSIT_ABI } from '@/abi/ETH_BEACON_DEPOSIT_ABI';
import { ETH_DEPOSIT_CONTRACT_ABI } from '@/abi/ETH_DEPOSIT_CONTRACT_ABI';
import { ETH_EXIT_CONTRACT_ABI } from '@/abi/ETH_EXIT_CONTRACT_ABI';
import { MATIC_STAKE_MANAGER_CONTRACT_ABI } from '@/abi/MATIC_STAKE_MANAGER_CONTRACT_ABI';
import { POL_CONTRACT_ABI } from '@/abi/POL_CONTRACT_ABI';
import { POL_STAKE_MANAGER_ABI } from '@/abi/POL_STAKE_MANAGER_ABI';
import { POL_VALIDATOR_SHARES_CONTRACT_ABI } from '@/abi/POL_VALIDATOR_SHARES_CONTRACT_ABI';

// Contract addresses
export const CCTP_MESSAGE_TRANSMITTER_ADDRESS = '0x0a992d191deec32afe36203ad87d7d289a738f81' as const;
export const POL_STAKE_MANAGER_ADDRESS = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908' as const;
export const POL_VALIDATOR_SHARES_ADDRESS = '0xD14a87025109013B0a2354a775cB335F926Af65A' as const;
export const POL_CONTRACT_ADDRESS = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' as const;
export const ETH_DEPOSIT_CONTRACT_ADDRESS = '0x576834cB068e677db4aFF6ca245c7bde16C3867e' as const;
export const ETH_EXIT_CONTRACT_ADDRESS = '0x004C226FFF73aA94b78a4Df1A0e861797BA16819' as const;
export const ETH_BEACON_DEPOSIT_CONTRACT_ADDRESS = '0x00000000219ab540356cBB839Cbe05303d7705Fa' as const;
export const MATIC_STAKE_MANAGER_CONTRACT_ADDRESS = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0' as const;
export const EIGENLAYER_POD_MANAGER_ADDRESS = '0x30770d7E3e71112d7A6b7259542D1f680a70e315' as const;
export const EIGENLAYER_DELEGATION_MANAGER_ADDRESS = '0xA44151489861Fe9e3055d95adC98FbD462B948e7' as const;
export const EXIT_QUEUE_HELPER_ADDRESS = '0x8fe52F7FcE2eD6304aca6D45D5c993D5be06852A' as const;

// Contract names mapping
export const CONTRACT_NAMES = {
  [ETH_BEACON_DEPOSIT_CONTRACT_ADDRESS]: 'ETH Beacon Deposit Contract',
  [ETH_DEPOSIT_CONTRACT_ADDRESS]: 'ETH Deposit Contract',
  [ETH_EXIT_CONTRACT_ADDRESS]: 'ETH Exit Contract',
  [POL_STAKE_MANAGER_ADDRESS]: 'POL Stake Manager Contract',
  [POL_VALIDATOR_SHARES_ADDRESS]: 'POL Validator Shares Contract',
  [POL_CONTRACT_ADDRESS]: 'POL Contract',
  [CCTP_MESSAGE_TRANSMITTER_ADDRESS]: 'CCTP Message Transmitter Contract',
  [MATIC_STAKE_MANAGER_CONTRACT_ADDRESS]: 'MATIC Stake Manager Contract',
  [EIGENLAYER_POD_MANAGER_ADDRESS]: 'Eigenlayer Pod Manager Contract',
  [EIGENLAYER_DELEGATION_MANAGER_ADDRESS]: 'Eigenlayer Delegation Manager Contract',
  [EXIT_QUEUE_HELPER_ADDRESS]: 'Exit Queue Helper Contract',
} as const;

// ABIs mapping
export const ABIS = {
  [ETH_BEACON_DEPOSIT_CONTRACT_ADDRESS]: ETH_BEACON_DEPOSIT_ABI,
  [ETH_DEPOSIT_CONTRACT_ADDRESS]: ETH_DEPOSIT_CONTRACT_ABI,
  [ETH_EXIT_CONTRACT_ADDRESS]: ETH_EXIT_CONTRACT_ABI,
  [POL_STAKE_MANAGER_ADDRESS]: POL_STAKE_MANAGER_ABI,
  [POL_VALIDATOR_SHARES_ADDRESS]: POL_VALIDATOR_SHARES_CONTRACT_ABI,
  [POL_CONTRACT_ADDRESS]: POL_CONTRACT_ABI,
  [CCTP_MESSAGE_TRANSMITTER_ADDRESS]: CCTP_MESSAGE_TRANSMITTER_ABI,
  [MATIC_STAKE_MANAGER_CONTRACT_ADDRESS]: MATIC_STAKE_MANAGER_CONTRACT_ABI,
  [EIGENLAYER_POD_MANAGER_ADDRESS]: parseAbi(['function createPod() external returns (address)']),
  [EIGENLAYER_DELEGATION_MANAGER_ADDRESS]: parseAbi([
    'function undelegate(address staker) external returns (bytes32[] memory withdrawalRoots)',
    'struct SignatureWithExpiry { bytes signature; uint256 expiry; }',
    'function delegateTo(address operator, SignatureWithExpiry approverSignatureAndExpiry, bytes32 approverSalt) external',
    'struct QueuedWithdrawalParams { address[] strategies; uint256[] shares; address withdrawer; }',
    'function queueWithdrawals(QueuedWithdrawalParams[] calldata queuedWithdrawalParams) external returns (bytes32[])',
    'struct Withdrawal { address staker; address delegatedTo; address withdrawer; uint256 nonce; uint32 startBlock; address[] strategies; uint256[] shares; }',
    'function completeQueuedWithdrawals(Withdrawal[] calldata withdrawals, address[][] calldata tokens, uint256[] calldata middlewareTimesIndexes, bool[] calldata receiveAsTokens) external',
  ]),
  erc4626Abi,
  erc20Abi,
  dedicatedStaking: parseAbi(['function requestValidatorsExit(bytes _publicKeys) external']),
  poolingStaking: parseAbi([
    'function requestValidatorsExit(bytes _publicKeys) external',
    'function stake() external payable',
  ]),
  [EXIT_QUEUE_HELPER_ADDRESS]: parseAbi([
    'function multiClaim(address[] exitQueues, uint256[][] ticketIds, uint32[][] casksIds) external',
  ]),
} as const;

export type ContractAbi = (typeof ABIS)[keyof typeof ABIS];

export type FunctionNameToAbiMap = {
  batchDeposit: (typeof ABIS)[typeof ETH_DEPOSIT_CONTRACT_ADDRESS];
  batchDepositCustom: (typeof ABIS)[typeof ETH_DEPOSIT_CONTRACT_ADDRESS];
  bigBatchDepositCustom: (typeof ABIS)[typeof ETH_DEPOSIT_CONTRACT_ADDRESS];
  bigBatchDeposit: (typeof ABIS)[typeof ETH_DEPOSIT_CONTRACT_ADDRESS];
  buyVoucher: (typeof ABIS)[typeof MATIC_STAKE_MANAGER_CONTRACT_ADDRESS];
  sellVoucher: (typeof ABIS)[typeof MATIC_STAKE_MANAGER_CONTRACT_ADDRESS];
  unstakeClaimTokens: (typeof ABIS)[typeof MATIC_STAKE_MANAGER_CONTRACT_ADDRESS];
  withdrawRewards: (typeof ABIS)[typeof MATIC_STAKE_MANAGER_CONTRACT_ADDRESS];
  restake: (typeof ABIS)[typeof MATIC_STAKE_MANAGER_CONTRACT_ADDRESS];
  buyVoucherPOL: (typeof ABIS)[typeof POL_STAKE_MANAGER_ADDRESS];
  sellVoucherPOL: (typeof ABIS)[typeof POL_STAKE_MANAGER_ADDRESS];
  withdrawRewardsPOL: (typeof ABIS)[typeof POL_STAKE_MANAGER_ADDRESS];
  restakePOL: (typeof ABIS)[typeof POL_STAKE_MANAGER_ADDRESS];
  undelegate: (typeof ABIS)[typeof EIGENLAYER_DELEGATION_MANAGER_ADDRESS];
  delegateTo: (typeof ABIS)[typeof EIGENLAYER_DELEGATION_MANAGER_ADDRESS];
  completeQueuedWithdrawals: (typeof ABIS)[typeof EIGENLAYER_DELEGATION_MANAGER_ADDRESS];
  createPod: (typeof ABIS)[typeof EIGENLAYER_POD_MANAGER_ADDRESS];
  approve: (typeof ABIS)['erc20Abi'];
  multiClaim: (typeof ABIS)[typeof EXIT_QUEUE_HELPER_ADDRESS];
  stake: (typeof ABIS)['poolingStaking'];
  deposit: (typeof ABIS)['erc4626Abi'];
  redeem: (typeof ABIS)['erc4626Abi'];
  withdraw: (typeof ABIS)['erc4626Abi'];
  requestValidatorsExit: (typeof ABIS)['dedicatedStaking'];
  requestExit: (typeof ABIS)[typeof ETH_EXIT_CONTRACT_ADDRESS];
  maxWithdraw: (typeof ABIS)['erc4626Abi'];
  withdrawableRestakedExecutionLayerGwei: (typeof ABIS)[typeof ETH_EXIT_CONTRACT_ADDRESS];
  delegatedTo: (typeof ABIS)[typeof EIGENLAYER_DELEGATION_MANAGER_ADDRESS];
};
