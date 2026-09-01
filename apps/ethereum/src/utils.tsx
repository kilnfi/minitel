import { Address as AddressComponent } from '@protocols/ui';
import type { ReactNode } from 'react';
import { type Address, type erc20Abi, formatEther, type Hash } from 'viem';
import type { ASYNC_VAULT_ABI } from '@/abi/ASYNC_VAULT_ABI';
import type { ETH_DEPOSIT_CONTRACT_ABI } from '@/abi/ETH_DEPOSIT_CONTRACT_ABI';
import type { ETH_EXIT_CONTRACT_ABI } from '@/abi/ETH_EXIT_CONTRACT_ABI';
import type { MATIC_STAKE_MANAGER_CONTRACT_ABI } from '@/abi/MATIC_STAKE_MANAGER_CONTRACT_ABI';
import type { FunctionNameToAbiMap } from '@/constant';
import type { AugmentedTransaction, AugmentedTransactionWithFunction, ExtractArgs } from '@/types';

export const normalizeHex = (txRaw: string): `0x${string}` => {
  return (txRaw.startsWith('0x') ? txRaw : `0x${txRaw}`) as `0x${string}`;
};

export function ethExplorerLink(
  hash: Hash | Address | string | number,
  type: 'address' | 'block' | 'validator_exit' | 'validator' | 'tx',
) {
  return {
    validator_exit: `https://beaconcha.in/validator/${hash}#withdrawals`,
    validator: `https://beaconcha.in/validator/${hash}`,
    tx: `https://etherscan.io/tx/${hash}`,
    address: `https://etherscan.io/address/${hash}`,
    block: `https://etherscan.io/block/${hash}`,
  }[type];
}

export function shortenAddress(address: `0x${string}`): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/** What the transaction does. Judging it is the verdict's job — see kiln-operations.ts. */
type DetailsResult = {
  description: ReactNode;
};

const ACTION_HANDLERS = {
  batchDeposit: (tx) => {
    const valueInWei = tx.value ? BigInt(tx.value) : 0n;
    const ethAmount = formatEther(valueInWei);
    const args = tx.inputData.args as ExtractArgs<typeof ETH_DEPOSIT_CONTRACT_ABI, 'batchDeposit'>;
    const dataRoots = args[3];
    return {
      description: (
        <div>
          Batch staking {ethAmount} ETH for {dataRoots.length} validator(s)
        </div>
      ),
    };
  },
  batchDepositCustom: (tx) => {
    const valueInWei = tx.value ? BigInt(tx.value) : 0n;
    const ethAmount = formatEther(valueInWei);
    const args = tx.inputData.args as ExtractArgs<typeof ETH_DEPOSIT_CONTRACT_ABI, 'batchDepositCustom'>;
    const dataRoots = args[3];
    return {
      description: (
        <>
          Batch staking {ethAmount} ETH for {dataRoots.length} validator(s)
        </>
      ),
    };
  },
  buyVoucher: (tx) => {
    const [amount, minShares] = tx.inputData.args as ExtractArgs<typeof MATIC_STAKE_MANAGER_CONTRACT_ABI, 'buyVoucher'>;
    return {
      description: (
        <>
          Delegating {formatEther(amount)} tokens (min shares: {formatEther(minShares)})
        </>
      ),
    };
  },
  sellVoucher: (tx) => {
    const [claimAmount, maxShares] = tx.inputData.args as ExtractArgs<
      typeof MATIC_STAKE_MANAGER_CONTRACT_ABI,
      'sellVoucher'
    >;
    return {
      description: (
        <>
          Undelegating {formatEther(claimAmount)} tokens (max shares: {formatEther(maxShares)})
        </>
      ),
    };
  },
  unstakeClaimTokens: (_tx) => {
    return {
      description: 'Claiming unstaked tokens',
    };
  },
  withdrawRewards: (tx) => {
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Withdrawing rewards from <AddressComponent address={to} explorerLink={ethExplorerLink(to, 'address')} />
        </>
      ),
    };
  },
  restake: (_tx) => {
    return {
      description: 'Restaking rewards',
    };
  },
  buyVoucherPOL: (tx) => {
    const [amount, minShares] = tx.inputData.args as ExtractArgs<
      typeof MATIC_STAKE_MANAGER_CONTRACT_ABI,
      'buyVoucherPOL'
    >;
    return {
      description: (
        <>
          Delegating {formatEther(amount)} POL tokens (min shares: {formatEther(minShares)})
        </>
      ),
    };
  },
  sellVoucherPOL: (tx) => {
    const [claimAmount, maxShares] = tx.inputData.args as ExtractArgs<
      typeof MATIC_STAKE_MANAGER_CONTRACT_ABI,
      'sellVoucherPOL'
    >;
    return {
      description: (
        <>
          Undelegating {formatEther(claimAmount)} POL tokens (max shares: {formatEther(maxShares)})
        </>
      ),
    };
  },
  withdrawRewardsPOL: (tx) => {
    const to = tx.to ?? '0x';
    return {
      description: <>Withdrawing POL rewards from {shortenAddress(to)}</>,
    };
  },
  restakePOL: (_tx) => {
    return {
      description: 'Restaking POL rewards',
    };
  },
  undelegate: (_tx) => {
    return {
      description: 'Undelegating from EigenLayer operator',
    };
  },
  delegateTo: (_tx) => {
    return {
      description: 'Delegating to EigenLayer operator',
    };
  },
  completeQueuedWithdrawals: (_tx) => {
    return {
      description: 'Completing queued EigenLayer withdrawals',
    };
  },
  createPod: (_tx) => {
    return {
      description: 'Creating EigenLayer Pod',
    };
  },
  approve: (tx) => {
    const args = tx.inputData.args as ExtractArgs<typeof erc20Abi, 'approve'>;
    const spender = args[0];
    const amount = args[1];
    return {
      description: (
        <>
          Approving {amount.toString()} tokens for {shortenAddress(spender)}
        </>
      ),
    };
  },
  multiClaim: (_tx) => {
    return {
      description: 'Claiming multiple exit tickets',
    };
  },
  stake: (tx) => {
    const valueInWei = tx.value ? BigInt(tx.value) : 0n;
    const ethAmount = formatEther(valueInWei);
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Staking {ethAmount} ETH to {shortenAddress(to)}
        </>
      ),
    };
  },
  deposit: (tx) => {
    const valueInWei = tx.value ? BigInt(tx.value) : 0n;
    const ethAmount = formatEther(valueInWei);
    const hasEthValue = valueInWei > 0n;
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Depositing {ethAmount} ETH{hasEthValue ? '' : ' tokens'} to {shortenAddress(to)}
        </>
      ),
    };
  },
  redeem: (tx) => {
    const to = tx.to ?? '0x';
    return {
      description: <>Redeeming tokens from {shortenAddress(to)}</>,
    };
  },
  withdraw: (tx) => {
    const valueInWei = tx.value ? BigInt(tx.value) : 0n;
    const ethAmount = formatEther(valueInWei);
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Withdrawing {ethAmount} tokens from {shortenAddress(to)}
        </>
      ),
    };
  },
  requestValidatorsExit: () => {
    return {
      description: 'Requesting validator exit',
    };
  },
  requestExit: (tx) => {
    const [validators] = tx.inputData.args as ExtractArgs<typeof ETH_EXIT_CONTRACT_ABI, 'requestExit'>;
    return {
      description: <>Requesting validator exit for {validators.length} validator(s)</>,
    };
  },
  bigBatchDeposit: (tx) => {
    const valueInWei = tx.value ? BigInt(tx.value) : 0n;
    const ethAmount = formatEther(valueInWei);
    const [validators] = tx.inputData.args as ExtractArgs<typeof ETH_DEPOSIT_CONTRACT_ABI, 'bigBatchDeposit'>;
    return {
      description: (
        <>
          Big batch staking {ethAmount} ETH for {validators.length} validator(s)
        </>
      ),
    };
  },
  bigBatchDepositCustom: (tx) => {
    const valueInWei = tx.value ? BigInt(tx.value) : 0n;
    const ethAmount = formatEther(valueInWei);
    const [validators] = tx.inputData.args as ExtractArgs<typeof ETH_DEPOSIT_CONTRACT_ABI, 'bigBatchDepositCustom'>;
    return {
      description: (
        <>
          Big batch staking {ethAmount} ETH for {validators.length} validator(s)
        </>
      ),
    };
  },
  delegatedTo: (tx) => {
    const to = tx.to ?? '0x';
    return {
      description: <>Delegating to {shortenAddress(to)}</>,
    };
  },
  maxWithdraw: (tx) => {
    const to = tx.to ?? '0x';
    return {
      description: <>Withdrawing max tokens from {shortenAddress(to)}</>,
    };
  },
  withdrawableRestakedExecutionLayerGwei: (tx) => {
    const to = tx.to ?? '0x';
    return {
      description: <>Withdrawing restaked execution layer Gwei from {shortenAddress(to)}</>,
    };
  },
  cancelRequestDeposit: (tx) => {
    const to = tx.to ?? '0x';
    return {
      description: <>Cancelling deposit request on vault {shortenAddress(to)}</>,
    };
  },
  updateNewTotalAssets: (tx) => {
    const args = tx.inputData.args as ExtractArgs<typeof ASYNC_VAULT_ABI, 'updateNewTotalAssets'>;
    const newTotalAssets = args[0];
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Updating NAV to {newTotalAssets.toString()} on vault {shortenAddress(to)}
        </>
      ),
    };
  },
  requestDeposit: (tx) => {
    const args = tx.inputData.args as ExtractArgs<typeof ASYNC_VAULT_ABI, 'requestDeposit'>;
    const assets = args[0];
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Requesting deposit of {assets.toString()} assets on vault {shortenAddress(to)}
        </>
      ),
    };
  },
  requestRedeem: (tx) => {
    const args = tx.inputData.args as ExtractArgs<typeof ASYNC_VAULT_ABI, 'requestRedeem'>;
    const shares = args[0];
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Requesting withdrawal of {shares.toString()} shares on vault {shortenAddress(to)}
        </>
      ),
    };
  },
  settleDeposit: (tx) => {
    const args = tx.inputData.args as ExtractArgs<typeof ASYNC_VAULT_ABI, 'settleDeposit'>;
    const newTotalAssets = args[0];
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Settling deposits with total assets {newTotalAssets.toString()} on vault {shortenAddress(to)}
        </>
      ),
    };
  },
  settleRedeem: (tx) => {
    const args = tx.inputData.args as ExtractArgs<typeof ASYNC_VAULT_ABI, 'settleRedeem'>;
    const newTotalAssets = args[0];
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Settling redemptions with total assets {newTotalAssets.toString()} on vault {shortenAddress(to)}
        </>
      ),
    };
  },
  claimSharesAndRequestRedeem: (tx) => {
    const args = tx.inputData.args as ExtractArgs<typeof ASYNC_VAULT_ABI, 'claimSharesAndRequestRedeem'>;
    const sharesToRedeem = args[0];
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Claiming shares and requesting redemption of {sharesToRedeem.toString()} shares on vault {shortenAddress(to)}
        </>
      ),
    };
  },
  claimSharesOnBehalf: (tx) => {
    const to = tx.to ?? '0x';
    return {
      description: <>Claiming shares on behalf of controllers on vault {shortenAddress(to)}</>,
    };
  },
  syncDeposit: (tx) => {
    const args = tx.inputData.args as ExtractArgs<typeof ASYNC_VAULT_ABI, 'syncDeposit'>;
    const assets = args[0];
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Depositing {assets.toString()} assets on vault {shortenAddress(to)}
        </>
      ),
    };
  },
  close: (tx) => {
    const args = tx.inputData.args as ExtractArgs<typeof ASYNC_VAULT_ABI, 'close'>;
    const newTotalAssets = args[0];
    const to = tx.to ?? '0x';
    return {
      description: (
        <>
          Closing vault {shortenAddress(to)} with total assets {newTotalAssets.toString()}
        </>
      ),
    };
  },
} satisfies Record<keyof FunctionNameToAbiMap, (tx: AugmentedTransactionWithFunction) => DetailsResult>;

function isTransactionWithInputData(tx: AugmentedTransaction): tx is AugmentedTransactionWithFunction {
  return 'inputData' in tx;
}

export function getActionDetails(tx: AugmentedTransaction): DetailsResult {
  if (!tx.to)
    return {
      description: 'Unknown transaction',
    };

  const to = tx.to as `0x${string}`;
  const valueWei = tx.value ? BigInt(tx.value) : 0n;
  const ethAmount = formatEther(valueWei);
  const hasEthValue = valueWei > 0n;

  if (!isTransactionWithInputData(tx)) {
    if (hasEthValue) {
      return {
        description: (
          <>
            Sending {ethAmount} ETH to <AddressComponent address={to} explorerLink={ethExplorerLink(to, 'address')} />
          </>
        ),
      };
    }
    return {
      description: <>Calling contract {shortenAddress(to)}</>,
    };
  }

  const funcName = tx.inputData.functionName;
  if (!(funcName in ACTION_HANDLERS)) {
    return {
      description: <>Unknown function: {funcName}</>,
    };
  }
  const handler = ACTION_HANDLERS[funcName as keyof FunctionNameToAbiMap];
  const result = handler(tx);

  return result;
}

export const sampleTransaction = `0x02f908da01288402faf0808434dab592830996a294576834cb068e677db4aff6ca245c7bde16c3867e890f9ccd8a1c50800000b90864c82655b70000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000026000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000072000000000000000000000000000000000000000000000000000000000000001b0b66932c5da63610c0441716ab8b230412252cbbd3fb568820aaad1db8a14e1ec640cbea7d8fd2f338b87267b5c9143019735d8f0ee69713181de55d3a7812bac080222242fa7274381841439e334cadfcdd5d18d327259096391366c5f6451c6a358df0ba39fc1c7d95b4c5625768944d4afe6f938bd7756da86aff52fdbabea18fd35a79cd9a3e36df29053c52bd5d48f5f9ea5406a96c88b8ef7be8d1f19f99215adb303a1f04c8990a6dca640bac535d6ae77a20b7132d8181780f74b140ca0bd34d7587ba19cbfd6bb1a4d42eb2794d07f6bc68bfcdcf28da42495d10fed597081bfd532e75fb8a44760cfdcdc69abbab5a06b061d7780c11dfbb7211e4c994bc5c6610b18b33c25e3f490e00ed4a3171bf1e8be0e99f5d2a21129e7cca4af5fd88349336da617d0d036e31be28b4e9a0427be619aa5a2194d805db08bd6c4f9f51ee5ddcdcb05c6ec41d6cba526aa6ddbc547e86161d95727ff9baa2d917249929f049030bd6a3efc8d379cbdfd93727dd07c8f558998438479ad41fedb9103f281b10608ea4b3d166f5244cdd7c5e7d13d5c46d7abf67ffd0c86f4761c10abe7d1748675dd96ec03f8ec0c22b40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001200100000000000000000000008ee57a0966db56badbd3da402e8d3055d0476fbd0100000000000000000000008ee57a0966db56badbd3da402e8d3055d0476fbd0100000000000000000000008ee57a0966db56badbd3da402e8d3055d0476fbd0100000000000000000000008ee57a0966db56badbd3da402e8d3055d0476fbd0100000000000000000000008ee57a0966db56badbd3da402e8d3055d0476fbd0100000000000000000000008ee57a0966db56badbd3da402e8d3055d0476fbd0100000000000000000000008ee57a0966db56badbd3da402e8d3055d0476fbd0100000000000000000000008ee57a0966db56badbd3da402e8d3055d0476fbd0100000000000000000000008ee57a0966db56badbd3da402e8d3055d0476fbd000000000000000000000000000000000000000000000000000000000000036087d03ecdddc599a5004db61fb0e4da5f3d504d461e22802c65e8a432b9efdcad897ef08d5d85367041d4f427f80ed69708975e6a57fdf1fe2863c8fd64de7ce81728bb790a41f9e21dd4a8facac0bdb6ee4f821cdae8aa80760aa6c5c8dbff67ad18fec555023f328d1b57f9e6688c95640261f0d3d1dcba6ac3b9707480cad6ce813a601828f277e4c487504de294291235cd4c8b800ca6bd86944b03eaa78c6e38428159e657d7ce463c080685b80cf33f06ed4c5c2746b3e7308378bab6a7b3706a83f8efef69443d9d02ea8204286b454e9f6cb62851157a13f43a6ac50b3a33c1557a2ac925a20f1fc1920d8a5a00ccc78b01ac879fc3a6fb09cd578565b52cbb99fd44b8da3289a8aafe45232a3ee22581270c80f49a0969e62ff5bebd82a91c351f7f5f0484999eac88899ff60acd5d6c2a04fd65043d9da6b3e735123db28b9be1cd46537d2b4073f5f6b7241906bde539452c2ea1f7dcc460d150735ebb431b8c85346870957bc04acd7b135939ae256f39da0987b6cb0218fe48c9a73c2f739c631cdf525b33a1c2986dc184caad92615d30909e05667b59f86d3dfb91080396aa851890a32a2a68a0095206b9810496667d4f16ffabef9e7406019556b3d97d2752caf0abfb7a00f4ea12204975e5c7009aa87f7c991e17051b998e81008e2241846b09af3fbbb5eb8bd40301abfc0f9623e06e09b5dd2a6428c1664aefb17a8e42b5889dce4ef59742ea05ea54934d269557132bcb123036506bc3ac9aa39391ae183a59ce3a62c9979adc2bc3fb35f0da51dca9ddda72cd7a738122402dbb359e93f936daffb3cb07ca17509cc249df9d4e71d5bafb3462586a19b5cc193fbb47afaef159661546f0170e62c7f984c2e7fcf38811f3142d0237f47d4b42c33ef6dec95fc982c260f4fdd7d206bfa1ea956f747b1f272247fdeab99de2f4ec26fc13a4ea83df5c1abd47ea54c22bbfad84d1e3155aa40e5c63140c08eca5682c5d3891c3bcd57c2273c019eb117a0049a312f016181d721584445ae202f4e38ad65d2e22b25b182ba74e93effa0ba498a063a4fcf62b99468d968382d0201b752aad1b671cbaf259246fbbc290372e2b0a2a33f45c5d99fdd224c8a5491558b74a4a437a7e373b993bbf0280657063c5aed9c49c917ca522d88d0edeb15c4f3594bd3f3525c0d43fa11ad946898f34f6b63db764283c929e2fa8000000000000000000000000000000000000000000000000000000000000000937db485030aefd85b0289dc327e51caa9e521cd4b074a31e70b57314a8977d35ba494d572e55806bc7212177ef06001c8227bace8b1a994f004bac8f5a32116334c6a124a57401379d6760899b6f13c5d01e81a0b8e5f1321be275c6c36eaec111f8140435a8622a59e3aed59164af2f2f7269b1276b32eec81e020ef11851b05aba015b9282b9b50716247cc10227182211247318b2f44ca639f4d8a854a41abd750a73e1d08d9ceb6b702da2f39db1e5b6e32a0ebe0f4ad91e0b57fb521cc54616dca68777b7da2f26033bf4f33e0d2048a32280aebec304f6d215596d1c0c4537f6993368e1e1b2749c7c132f66d6a347bfdcfc4add7145e9d939414acb5858196a9e278b778c57237540446fa587f3a527e4222b0b52f790993c66fb2dc5c080a088878a44036d8bb71bf094e3baf92f26899338950a38d464562bc1d1bd24b77fa028cb9b266997ea4498722a4bb78c62fa700db82a499f9bd402ee299c9b9f9d8e`;

export const sampleTransaction2 = `0x04f902d9010184773594008559558e2ab4830223d4940d4a11d5eeaac28ec3f61d100daf4d40471f18528901bc16d674ec800000b902a4ca0bfcce0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000309696c02ec4dbb99f714e26ff1acdf6b258d36dcbad7b8b549553bc99b94ea639cd247f31683564995afd48568c1b6edd00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020010000000000000000000000bc86717bad3f8ccf86d2882a6bc351c94580a994000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060a3869da2ed5cc558f016d59fc5ceb0cac28e58743836aa3cf146221f1ef0b959e3cc5c589e05e171f1473596aadf36411767ad92edaae421ba0291bd7568267b3faabc3ab6ed9ddfc048ea6640370977f16f4f626a0e567a11ba25acdc520bb000000000000000000000000000000000000000000000000000000000000000012dd65914dda46639df6344701de54ac3ebe34a4b230262d3017fcd6c29954452c0c0`;
