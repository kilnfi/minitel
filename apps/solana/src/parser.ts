import { Buffer } from 'node:buffer';
import {
  Message,
  PublicKey,
  StakeInstruction,
  SystemInstruction,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import type { DecodedInstruction, StakeInstructionParams, SystemInstructionParams } from '@/types';
import { STAKE_PROGRAM_ID, SYSTEM_PROGRAM_ID } from '@/utils';

type MessageLike = {
  header: {
    numRequiredSignatures: number;
    numReadonlySignedAccounts: number;
    numReadonlyUnsignedAccounts: number;
  };
  recentBlockhash: string;
  accountKeys: string[];
  instructions: { programIdIndex: number; accounts: number[]; data: string }[];
};

const isHex = (s: string) => /^[0-9a-fA-F]+$/.test(s) && s.length % 2 === 0;

const looksLikeMessage = (obj: unknown): obj is MessageLike => {
  const msg = obj as Record<string, unknown>;
  return !!msg.header && !!msg.recentBlockhash && !!msg.accountKeys && !!msg.instructions;
};

const convertToMessage = (rawMsg: MessageLike): Message => {
  const accountKeys = rawMsg.accountKeys.map((key) => new PublicKey(key));

  const messageArgs = {
    ...rawMsg,
    accountKeys,
  };

  return new Message(messageArgs);
};

function buildInstructionsFromMessage(rawMsg: MessageLike): TransactionInstruction[] {
  const message = convertToMessage(rawMsg);

  return rawMsg.instructions.map((ix, _index) => {
    const programId = new PublicKey(rawMsg.accountKeys[ix.programIdIndex]);
    const keys = ix.accounts.map((i) => ({
      pubkey: new PublicKey(rawMsg.accountKeys[i]),
      isSigner: message.isAccountSigner(i),
      isWritable: message.isAccountWritable(i),
    }));

    const data = Buffer.from(bs58.decode(ix.data));
    return new TransactionInstruction({ programId, keys, data });
  });
}

function decodeOne(instruction: TransactionInstruction): DecodedInstruction {
  try {
    if (instruction.programId.equals(SYSTEM_PROGRAM_ID)) {
      const type = SystemInstruction.decodeInstructionType(instruction);
      let data: SystemInstructionParams | Record<string, unknown>;

      switch (type) {
        case 'AdvanceNonceAccount':
          data = SystemInstruction.decodeNonceAdvance(instruction);
          break;
        case 'Allocate':
          data = SystemInstruction.decodeAllocate(instruction);
          break;
        case 'AllocateWithSeed':
          data = SystemInstruction.decodeAllocateWithSeed(instruction);
          break;
        case 'Assign':
          data = SystemInstruction.decodeAssign(instruction);
          break;
        case 'AssignWithSeed':
          data = SystemInstruction.decodeAssignWithSeed(instruction);
          break;
        case 'AuthorizeNonceAccount':
          data = SystemInstruction.decodeNonceAuthorize(instruction);
          break;
        case 'Create':
          data = SystemInstruction.decodeCreateAccount(instruction);
          break;
        case 'CreateWithSeed':
          data = SystemInstruction.decodeCreateWithSeed(instruction);
          break;
        case 'InitializeNonceAccount':
          data = SystemInstruction.decodeNonceInitialize(instruction);
          break;
        case 'Transfer':
          data = SystemInstruction.decodeTransfer(instruction);
          break;
        case 'TransferWithSeed':
          data = SystemInstruction.decodeTransferWithSeed(instruction);
          break;
        case 'WithdrawNonceAccount':
          data = SystemInstruction.decodeNonceWithdraw(instruction);
          break;
        case 'UpgradeNonceAccount':
          data = {
            keys: instruction.keys,
            programId: instruction.programId,
            data: instruction.data,
          };
          break;
      }

      return {
        programId: instruction.programId.toString(),
        type,
        data,
        accounts: instruction.keys.map((key) => ({
          pubkey: key.pubkey.toString(),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
        ...(type === 'Assign' && {
          warning: '⚠️ This instruction changes program/account authority',
        }),
      };
    }

    if (instruction.programId.equals(STAKE_PROGRAM_ID)) {
      const type = StakeInstruction.decodeInstructionType(instruction);
      let data: StakeInstructionParams | Record<string, unknown>;

      switch (type) {
        case 'Authorize':
          data = StakeInstruction.decodeAuthorize(instruction);
          break;
        case 'AuthorizeWithSeed':
          data = StakeInstruction.decodeAuthorizeWithSeed(instruction);
          break;
        case 'Deactivate':
          data = StakeInstruction.decodeDeactivate(instruction);
          break;
        case 'Delegate':
          data = StakeInstruction.decodeDelegate(instruction);
          break;
        case 'Initialize':
          data = StakeInstruction.decodeInitialize(instruction);
          break;
        case 'Merge':
          data = StakeInstruction.decodeMerge(instruction);
          break;
        case 'Split':
          data = StakeInstruction.decodeSplit(instruction);
          break;
        case 'Withdraw':
          data = StakeInstruction.decodeWithdraw(instruction);
          break;
      }

      return {
        programId: instruction.programId.toString(),
        type,
        data,
        accounts: instruction.keys.map((key) => ({
          pubkey: key.pubkey.toString(),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
        ...(type === 'Authorize' && {
          warning: '⚠️ This instruction modifies stake account authority',
        }),
        ...(type === 'AuthorizeWithSeed' && {
          warning: '⚠️ This instruction modifies stake account authority using a seed',
        }),
        ...(type === 'Merge' && {
          warning: '⚠️ This instruction merges stake accounts',
        }),
        ...(type === 'Split' && {
          warning: '⚠️ This instruction splits stake into a new account',
        }),
        ...(type === 'Withdraw' && {
          warning: '⚠️ This instruction withdraws SOL from stake account',
        }),
      };
    }

    return {
      programId: instruction.programId.toString(),
      type: 'unknown',
      data: {},
      accounts: [],
      raw: {
        data: instruction.data.toString('hex'),
        accounts: instruction.keys.map((key) => ({
          pubkey: key.pubkey.toString(),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
      },
    };
  } catch (err) {
    return {
      programId: instruction.programId.toString(),
      type: 'error',
      data: {},
      accounts: [],
      error: err instanceof Error ? err.message : 'Unknown error',
      raw: {
        data: instruction.data.toString('hex'),
        accounts: instruction.keys.map((key) => ({
          pubkey: key.pubkey.toString(),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
      },
    };
  }
}

function safeDecode(ix: TransactionInstruction): DecodedInstruction {
  try {
    return decodeOne(ix);
  } catch (err) {
    return {
      programId: ix.programId.toString(),
      type: 'error',
      data: {},
      accounts: [],
      error: err instanceof Error ? err.message : 'Unknown error',
      raw: {
        data: Buffer.from(ix.data).toString('hex'),
        accounts: ix.keys.map((k) => ({
          pubkey: k.pubkey.toString(),
          isSigner: k.isSigner,
          isWritable: k.isWritable,
        })),
      },
    } satisfies DecodedInstruction;
  }
}

export type ParseSolTxResult = {
  signatures: string[];
  feePayer: string;
  recentBlockhash: string;
  instructions: DecodedInstruction[];
};

export const parseSolTx = (txRaw: string): ParseSolTxResult => {
  const input = txRaw.trim();

  // if input is a JSON object
  if (input.startsWith('{') || input.startsWith('[')) {
    try {
      const obj = JSON.parse(input);
      const msg: MessageLike = (obj.message ?? obj) as MessageLike;
      if (looksLikeMessage(msg)) {
        const instructions = buildInstructionsFromMessage(msg);
        const parsedInstructions = instructions.map(safeDecode);
        return {
          signatures: [],
          feePayer: msg.accountKeys[0],
          recentBlockhash: msg.recentBlockhash,
          instructions: parsedInstructions,
        };
      }
    } catch {
      // fall through to hex path
    }
  }

  if (!isHex(input)) {
    throw new Error('Input is not valid hex or Fireblocks message JSON');
  }

  try {
    const buffer = Buffer.from(input, 'hex');

    const tx = Transaction.from(buffer);
    const parsedInstructions = tx.instructions.map(safeDecode);
    return {
      signatures: tx.signatures.map((s) => (s.signature ? bs58.encode(s.signature) : '')),
      feePayer: tx.feePayer?.toString() ?? tx.signatures[0]?.publicKey?.toString() ?? '',
      recentBlockhash: tx.recentBlockhash ?? '',
      instructions: parsedInstructions,
    };
  } catch (error) {
    throw new Error(`Failed to parse Solana transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
