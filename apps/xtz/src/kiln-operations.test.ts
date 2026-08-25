import { describe, expect, test } from 'bun:test';
import { localForger } from '@taquito/local-forging';
import { classifyXtzTransaction } from '@/kiln-operations';
import { parseXtzTx } from '@/parser';

/** Each case is forged with Taquito and run back through the real parser. */

const wallet = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb';
const baker = 'tz1Kf25fX1VdmYGSEzwFy1wNmkbSEZ2V83sY';
const branch = 'BLockGenesisGenesisGenesisGenesisGenesisf79b5d1CoW2';

const common = { fee: '1000', counter: '1', gas_limit: '10000', storage_limit: '100' };

const forge = async (contents: unknown[]) => localForger.forge({ branch, contents } as never);

const classify = async (contents: unknown[]) => classifyXtzTransaction(await parseXtzTx(await forge(contents)));

const selfCall = (entrypoint: string, amount = '1000000') => ({
  kind: 'transaction',
  source: wallet,
  destination: wallet,
  amount,
  ...common,
  parameters: { entrypoint, value: { prim: 'Unit' } },
});

const reveal = () => ({
  kind: 'reveal',
  source: wallet,
  public_key: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
  ...common,
});

describe('Kiln Tezos operations are recognized', () => {
  test('stake', async () => {
    expect(await classify([selfCall('stake')])).toMatchObject({ status: 'recognized', operation: 'stake' });
  });

  test('unstake', async () => {
    expect(await classify([selfCall('unstake')])).toMatchObject({ status: 'recognized', operation: 'unstake' });
  });

  test('finalize-unstake', async () => {
    expect(await classify([selfCall('finalize_unstake', '0')])).toMatchObject({
      status: 'recognized',
      operation: 'finalize-unstake',
    });
  });

  test('delegate — a baker is set', async () => {
    const verdict = await classify([{ kind: 'delegation', source: wallet, delegate: baker, ...common }]);

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'delegate' });
  });

  test('undelegate — the delegate is cleared', async () => {
    const verdict = await classify([{ kind: 'delegation', source: wallet, ...common }]);

    expect(verdict).toMatchObject({ status: 'recognized', operation: 'undelegate' });
  });

  test('a reveal preceding a stake is treated as envelope', async () => {
    expect(await classify([reveal(), selfCall('stake')])).toMatchObject({
      status: 'recognized',
      operation: 'stake',
    });
  });
});

describe('Non-Kiln Tezos transactions are rejected', () => {
  test('a plain tez transfer', async () => {
    const verdict = await classify([
      { kind: 'transaction', source: wallet, destination: baker, amount: '1000000', ...common },
    ]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('plain tez transfer') });
  });

  test('a call to some other entrypoint', async () => {
    const verdict = await classify([
      {
        kind: 'transaction',
        source: wallet,
        destination: wallet,
        amount: '0',
        ...common,
        parameters: { entrypoint: 'set_delegate_parameters', value: { prim: 'Unit' } },
      },
    ]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('set_delegate_parameters entrypoint') });
  });

  test('a stake entrypoint aimed at someone else', async () => {
    const verdict = await classify([
      {
        kind: 'transaction',
        source: wallet,
        destination: baker,
        amount: '1000000',
        ...common,
        parameters: { entrypoint: 'stake', value: { prim: 'Unit' } },
      },
    ]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('not on your own account') });
  });

  test('a transfer smuggled alongside a valid stake', async () => {
    const verdict = await classify([
      selfCall('stake'),
      { kind: 'transaction', source: wallet, destination: baker, amount: '1000000', ...common, counter: '2' },
    ]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('bundles 2 operations') });
  });

  test('a reveal on its own', async () => {
    const verdict = await classify([reveal()]);

    expect(verdict.status).toBe('unrecognized');
    expect(verdict).toMatchObject({ reason: expect.stringContaining('only reveals a public key') });
  });
});
