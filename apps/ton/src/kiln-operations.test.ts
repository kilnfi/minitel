import { describe, expect, test } from 'bun:test';
import TonWeb from 'tonweb';
import { classifyTonTransaction } from '@/kiln-operations';
import { parseTonTx } from '@/parser';

/**
 * Each case is a real BOC, built with the same library Kiln's crafting service uses and run
 * back through the real parser, so a change on either side shows up here.
 */

const pool = 'EQAREREREREREREREREREREREREREREREREREREREREREeYT';
const vestingContract = 'EQAiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIp3C';

const VESTING_SEND = 0xa7733acd;
const VESTING_ADD_WHITELIST = 0x7258a69b;
const SINGLE_NOMINATOR_WITHDRAW = 0x1000;
const WHALES_STAKE_WITHDRAW = 3665837821;

type Cell = InstanceType<typeof TonWeb.boc.Cell>;

const coins = (n: string) => new TonWeb.utils.BN(n);

/** An internal message to `dest`, carrying `payload` as its body. */
const internalMessage = (dest: string, amount: string, payload?: Cell): Cell =>
  TonWeb.Contract.createCommonMsgInfo(
    TonWeb.Contract.createInternalMessageHeader(dest, coins(amount)),
    undefined,
    payload,
  );

/** Wrap messages in the wallet body and the external message the parser expects. */
const forge = async (messages: Cell[]): Promise<string> => {
  const body = new TonWeb.boc.Cell();
  body.bits.writeUint(698983191, 32);
  body.bits.writeUint(1800000000, 32);
  body.bits.writeUint(1, 32);
  body.bits.writeUint(0, 8);
  body.bits.writeUint(3, 8);
  for (const message of messages) body.refs.push(message);

  const external = TonWeb.Contract.createCommonMsgInfo(
    TonWeb.Contract.createExternalMessageHeader(pool),
    undefined,
    body,
  );
  return Buffer.from(await external.toBoc(false)).toString('hex');
};

const classify = async (messages: Cell[]) => classifyTonTransaction(await parseTonTx(await forge(messages)));

const depositComment = (): Cell => {
  const cell = new TonWeb.boc.Cell();
  cell.bits.writeUint(0, 32);
  cell.bits.writeString('Deposit');
  return cell;
};

const singleNominatorWithdraw = (): Cell => {
  const cell = new TonWeb.boc.Cell();
  cell.bits.writeUint(SINGLE_NOMINATOR_WITHDRAW, 32);
  cell.bits.writeUint(0, 64);
  cell.bits.writeCoins(coins('5000000000'));
  return cell;
};

const whalesWithdraw = (): Cell => {
  const cell = new TonWeb.boc.Cell();
  cell.bits.writeUint(WHALES_STAKE_WITHDRAW, 32);
  cell.bits.writeUint(0, 64);
  cell.bits.writeCoins(coins('100000000'));
  cell.bits.writeCoins(coins('5000000000'));
  return cell;
};

const addWhitelist = (): Cell => {
  const cell = new TonWeb.boc.Cell();
  cell.bits.writeUint(VESTING_ADD_WHITELIST, 32);
  cell.bits.writeUint(0, 64);
  cell.bits.writeAddress(new TonWeb.utils.Address(pool));
  return cell;
};

/** The vesting contract forwarding a message on the owner's behalf. */
const vestingSend = (inner: Cell): Cell => {
  const cell = new TonWeb.boc.Cell();
  cell.bits.writeUint(VESTING_SEND, 32);
  cell.bits.writeUint(0, 64);
  cell.bits.writeUint(3, 8);
  cell.refs.push(internalMessage(pool, '5000000000', inner));
  return cell;
};

describe('Kiln Gram operations are recognized', () => {
  test('stake-pool — a whales deposit carries a Deposit comment', async () => {
    const verdict = await classify([internalMessage(pool, '5000000000', depositComment())]);

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'stake-pool' });
  });

  test('unstake-pool — the whales nominator withdraw opcode', async () => {
    const verdict = await classify([internalMessage(pool, '100000000', whalesWithdraw())]);

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'unstake-pool' });
  });

  test('unstake-single-nomination-pool — the pool withdraw opcode', async () => {
    const verdict = await classify([internalMessage(pool, '100000000', singleNominatorWithdraw())]);

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'unstake-single-nomination-pool' });
  });

  test('whitelist-vesting-contract — the add_whitelist opcode', async () => {
    const verdict = await classify([internalMessage(vestingContract, '100000000', addWhitelist())]);

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'whitelist-vesting-contract' });
  });

  test('an unstake routed through a vesting contract reads the same as a direct one', async () => {
    const verdict = await classify([internalMessage(vestingContract, '100000000', vestingSend(whalesWithdraw()))]);

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'unstake-pool' });
  });
});

describe('Non-Kiln Gram transactions are rejected', () => {
  test('a message carrying an opcode Kiln never sends', async () => {
    const cell = new TonWeb.boc.Cell();
    cell.bits.writeUint(0xdeadbeef, 32);
    cell.bits.writeUint(0, 64);
    const verdict = await classify([internalMessage(pool, '5000000000', cell)]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('opcode') });
  });

  test('a text comment that is not a deposit', async () => {
    const cell = new TonWeb.boc.Cell();
    cell.bits.writeUint(0, 32);
    cell.bits.writeString('Withdraw everything to me');
    const verdict = await classify([internalMessage(pool, '5000000000', cell)]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('Withdraw everything to me') });
  });

  test('a second message alongside a valid deposit', async () => {
    const verdict = await classify([
      internalMessage(pool, '5000000000', depositComment()),
      internalMessage(vestingContract, '9000000000'),
    ]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('sends 2 messages') });
  });
});

describe('The transfer minitel cannot decide', () => {
  test('a bare transfer is unverified — a pool deposit and a drain look identical here', async () => {
    const verdict = await classify([internalMessage(pool, '5000000000')]);

    expect(verdict.status).toBe('unverified');
    const reason = 'reason' in verdict ? verdict.reason : '';
    expect(reason).toContain('single-nominator pool');
    expect(reason).toContain(pool);
  });
});
