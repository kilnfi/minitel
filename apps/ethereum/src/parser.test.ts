import { describe, expect, test } from 'bun:test';
import { encodeFunctionData, parseAbi } from 'viem';
import { EIGENLAYER_DELEGATION_MANAGER_ADDRESS, ETH_EXIT_CONTRACT_ADDRESS } from '@/constant';
import { parseEthTx } from '@/parser';

/**
 * The address→ABI map is keyed by destination address alone, so a transaction on another EVM
 * chain targeting one of those addresses used to inherit an Ethereum protocol label.
 */

const DELEGATION_MANAGER_ABI = parseAbi([
  'struct SignatureWithExpiry { bytes signature; uint256 expiry; }',
  'function delegateTo(address operator, SignatureWithExpiry approverSignatureAndExpiry, bytes32 approverSalt) external',
]);

const delegateToCalldata = encodeFunctionData({
  abi: DELEGATION_MANAGER_ABI,
  functionName: 'delegateTo',
  args: ['0x1111111111111111111111111111111111111111', { signature: '0x', expiry: 0n }, `0x${'00'.repeat(32)}`],
});

/** A transaction the way the manual-input form builds it, as JSON. */
const tx = ({ to, data, chainId }: { to: string; data: string; chainId?: string }) =>
  JSON.stringify({ to, data, ...(chainId === undefined ? {} : { chainId }), value: '0', nonce: '0' });

describe('protocol ABIs are only applied on Ethereum chains', () => {
  test('delegateTo on mainnet decodes as the EigenLayer action', async () => {
    const parsed = await parseEthTx(
      tx({ to: EIGENLAYER_DELEGATION_MANAGER_ADDRESS, data: delegateToCalldata, chainId: '1' }),
    );

    expect(parsed).toHaveProperty('inputData');
    expect(parsed).toMatchObject({ inputData: { functionName: 'delegateTo' } });
  });

  test.each([
    ['Base', '8453'],
    ['Arbitrum', '42161'],
    ['Optimism', '10'],
  ])('the same calldata on %s is not labeled as an Ethereum protocol action', async (_name, chainId) => {
    const parsed = await parseEthTx(
      tx({ to: EIGENLAYER_DELEGATION_MANAGER_ADDRESS, data: delegateToCalldata, chainId }),
    );

    expect(parsed).not.toHaveProperty('inputData');
  });

  test('a transaction with no chain id at all is not labeled either', async () => {
    const parsed = await parseEthTx(tx({ to: EIGENLAYER_DELEGATION_MANAGER_ADDRESS, data: delegateToCalldata }));

    expect(parsed).not.toHaveProperty('inputData');
  });

  test('the Ethereum testnets Kiln uses still decode', async () => {
    const requestExit = encodeFunctionData({
      abi: parseAbi(['function requestExit(bytes[] validators_) external']),
      functionName: 'requestExit',
      args: [[`0x${'ab'.repeat(48)}`]],
    });

    for (const chainId of ['11155111', '560048']) {
      const parsed = await parseEthTx(tx({ to: ETH_EXIT_CONTRACT_ADDRESS, data: requestExit, chainId }));
      expect(parsed).toMatchObject({ inputData: { functionName: 'requestExit' } });
    }
  });
});

describe('chain-agnostic token standards still decode anywhere', () => {
  test('an ERC-20 approve decodes on Base, since the selector alone identifies it', async () => {
    const approve = encodeFunctionData({
      abi: parseAbi(['function approve(address spender, uint256 amount) returns (bool)']),
      functionName: 'approve',
      args: ['0x2222222222222222222222222222222222222222', 1n],
    });

    const parsed = await parseEthTx(
      tx({ to: '0x3333333333333333333333333333333333333333', data: approve, chainId: '8453' }),
    );

    expect(parsed).toMatchObject({ inputData: { functionName: 'approve' } });
  });
});
