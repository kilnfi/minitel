import { Buffer } from 'node:buffer';
import { PublicKey } from '@near-js/crypto';
import { type Action, Transaction } from '@near-js/transactions';

export type DecodedAction =
  | { type: 'functionCall'; methodName: string; args: Record<string, unknown>; gas: string; deposit: string; stakingOperation: 'stake' | 'unstake' | 'withdraw' | null }
  | { type: 'transfer'; amount: string }
  | { type: 'createAccount' }
  | { type: 'deleteAccount'; beneficiaryId: string }
  | { type: 'addKey'; publicKey: string }
  | { type: 'deleteKey'; publicKey: string }
  | { type: 'deployContract'; codeSize: number }
  | { type: 'stake'; amount: string; publicKey: string }
  | { type: 'unsupported'; raw: string };

export type NearTransaction = {
  signerId: string;
  publicKey: string;
  nonce: string;
  receiverId: string;
  blockHash: string;
  actions: DecodedAction[];
};

const parseArgs = (args: Uint8Array): Record<string, unknown> => {
  try {
    return JSON.parse(Buffer.from(args).toString('utf8'));
  } catch {
    return {};
  }
};

const decodeAction = (action: Action): DecodedAction => {
  if ('createAccount' in action && action.createAccount) {
    return { type: 'createAccount' };
  }

  if ('transfer' in action && action.transfer) {
    return {
      type: 'transfer',
      amount: action.transfer.deposit.toString(),
    };
  }

  if ('deployContract' in action && action.deployContract) {
    return {
      type: 'deployContract',
      codeSize: action.deployContract.code.length,
    };
  }

  // Native Stake action (different from deposit_and_stake)
  if ('stake' in action && action.stake) {
    return {
      type: 'stake',
      amount: action.stake.stake.toString(),
      publicKey: action.stake.publicKey.toString(),
    };
  }

  if ('addKey' in action && action.addKey) {
    return {
      type: 'addKey',
      publicKey: action.addKey.publicKey.toString(),
    };
  }

  if ('deleteKey' in action && action.deleteKey) {
    return {
      type: 'deleteKey',
      publicKey: action.deleteKey.publicKey.toString(),
    };
  }

  if ('deleteAccount' in action && action.deleteAccount) {
    return {
      type: 'deleteAccount',
      beneficiaryId: action.deleteAccount.beneficiaryId,
    };
  }

  // FunctionCall - all function calls including staking operations
  if ('functionCall' in action && action.functionCall) {
    const fc = action.functionCall;
    const method = fc.methodName;
    const args = parseArgs(fc.args);

    // Identify staking operations but keep them as functionCall type
    let stakingOperation: 'stake' | 'unstake' | 'withdraw' | null = null;

    if (method === 'deposit_and_stake') {
      stakingOperation = 'stake';
    } else if (['unstake', 'unstake_all'].includes(method)) {
      stakingOperation = 'unstake';
    } else if (['withdraw', 'withdraw_all'].includes(method)) {
      stakingOperation = 'withdraw';
    }

    return {
      type: 'functionCall',
      methodName: method,
      args,
      gas: fc.gas.toString(),
      deposit: fc.deposit.toString(),
      stakingOperation,
    };
  }

  return {
    type: 'unsupported',
    raw: JSON.stringify(action),
  };
};

const formatPublicKey = (publicKey: PublicKey): string => {
  if ('ed25519Key' in publicKey && publicKey.ed25519Key && 'data' in publicKey.ed25519Key) {
    return new PublicKey({ keyType: 0, data: new Uint8Array(publicKey.ed25519Key.data) }).toString();
  }
  return publicKey.toString();
};

const transformTransaction = (tx: Transaction): NearTransaction => {
  return {
    signerId: tx.signerId,
    publicKey: formatPublicKey(tx.publicKey),
    nonce: tx.nonce.toString(16),
    receiverId: tx.receiverId,
    blockHash: Buffer.from(tx.blockHash).toString('hex'),
    actions: tx.actions.map(decodeAction),
  };
};

export const parseNearTx = (txRaw: string) => {
  const tx = Transaction.decode(Buffer.from(txRaw, 'hex'));
  return transformTransaction(tx);
};
