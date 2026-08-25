import { describe, expect, test } from 'bun:test';
import {
  Authorized,
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  StakeProgram,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { classifySolanaTransaction } from '@/kiln-operations';
import { parseSolTx } from '@/parser';

/**
 * The instruction sequences below mirror how Kiln's transaction-crafting API builds each operation, so a
 * change on either side shows up here rather than in production.
 */

const wallet = Keypair.generate().publicKey;
const nonceAccount = Keypair.generate().publicKey;
const stakeAccount = Keypair.generate().publicKey;
const voteAccount = Keypair.generate().publicKey;

const nonceAdvance = () => SystemProgram.nonceAdvance({ noncePubkey: nonceAccount, authorizedPubkey: wallet });

/** Serialize an unsigned transaction the way minitel receives it, then run the real parser. */
const classify = async (tx: Transaction) => {
  tx.feePayer = wallet;
  tx.recentBlockhash = new PublicKey(Buffer.alloc(32, 1)).toBase58();
  const hex = tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('hex');
  const parsed = await parseSolTx(hex);
  return classifySolanaTransaction(parsed.instructions);
};

describe('Kiln Solana operations are recognized', () => {
  test('stake — nonce advance, create stake account, delegate', async () => {
    const tx = new Transaction().add(
      nonceAdvance(),
      StakeProgram.createAccount({
        fromPubkey: wallet,
        authorized: new Authorized(wallet, wallet),
        lamports: 1_000_000_000,
        stakePubkey: stakeAccount,
      }),
      StakeProgram.delegate({ stakePubkey: stakeAccount, authorizedPubkey: wallet, votePubkey: voteAccount }),
    );

    const verdict = await classify(tx);
    expect(verdict.status).toBe('recognized');
    expect(verdict).toMatchObject({ operation: 'stake' });
  });

  test('deactivate-stake', async () => {
    const tx = new Transaction().add(
      nonceAdvance(),
      StakeProgram.deactivate({ stakePubkey: stakeAccount, authorizedPubkey: wallet }),
    );

    expect(await classify(tx)).toMatchObject({ status: 'recognized', operation: 'deactivate-stake' });
  });

  test('withdraw-stake', async () => {
    const tx = new Transaction().add(
      nonceAdvance(),
      StakeProgram.withdraw({
        stakePubkey: stakeAccount,
        authorizedPubkey: wallet,
        toPubkey: wallet,
        lamports: 1_000,
      }),
    );

    expect(await classify(tx)).toMatchObject({ status: 'recognized', operation: 'withdraw-stake' });
  });

  test('merge-stakes', async () => {
    const tx = new Transaction().add(
      nonceAdvance(),
      StakeProgram.merge({
        stakePubkey: stakeAccount,
        sourceStakePubKey: Keypair.generate().publicKey,
        authorizedPubkey: wallet,
      }),
    );

    expect(await classify(tx)).toMatchObject({ status: 'recognized', operation: 'merge-stakes' });
  });

  test('split-stake', async () => {
    const tx = new Transaction().add(
      nonceAdvance(),
      StakeProgram.split(
        {
          stakePubkey: stakeAccount,
          authorizedPubkey: wallet,
          splitStakePubkey: Keypair.generate().publicKey,
          lamports: 1_000_000,
        },
        2_282_880,
      ),
    );

    expect(await classify(tx)).toMatchObject({ status: 'recognized', operation: 'split-stake' });
  });

  test('compute budget and memo instructions do not change the verdict', async () => {
    const tx = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }),
      nonceAdvance(),
      StakeProgram.deactivate({ stakePubkey: stakeAccount, authorizedPubkey: wallet }),
      new TransactionInstruction({
        keys: [{ pubkey: wallet, isSigner: true, isWritable: true }],
        data: Buffer.from('kiln', 'utf-8'),
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      }),
    );

    expect(await classify(tx)).toMatchObject({ status: 'recognized', operation: 'deactivate-stake' });
  });
});

describe('Everything else fails closed', () => {
  test('a plain SOL transfer is not a Kiln operation', async () => {
    const tx = new Transaction().add(
      SystemProgram.transfer({ fromPubkey: wallet, toPubkey: Keypair.generate().publicKey, lamports: 5_000 }),
    );

    expect(await classify(tx)).toMatchObject({ status: 'unrecognized' });
  });

  test('an instruction from an unknown program is not a Kiln operation', async () => {
    const tx = new Transaction().add(
      new TransactionInstruction({
        keys: [{ pubkey: wallet, isSigner: true, isWritable: true }],
        data: Buffer.from([1, 2, 3, 4]),
        programId: Keypair.generate().publicKey,
      }),
    );

    expect(await classify(tx)).toMatchObject({ status: 'unrecognized' });
  });

  test('stake authority reassignment is not a Kiln operation', async () => {
    const tx = new Transaction().add(
      nonceAdvance(),
      StakeProgram.authorize({
        stakePubkey: stakeAccount,
        authorizedPubkey: wallet,
        newAuthorizedPubkey: Keypair.generate().publicKey,
        stakeAuthorizationType: { index: 0 },
      }),
    );

    expect(await classify(tx)).toMatchObject({ status: 'unrecognized' });
  });

  test('a hostile instruction smuggled alongside a valid deactivate is caught', async () => {
    const tx = new Transaction().add(
      nonceAdvance(),
      StakeProgram.deactivate({ stakePubkey: stakeAccount, authorizedPubkey: wallet }),
      SystemProgram.transfer({ fromPubkey: wallet, toPubkey: Keypair.generate().publicKey, lamports: 5_000 }),
    );

    expect(await classify(tx)).toMatchObject({ status: 'unrecognized' });
  });
});
