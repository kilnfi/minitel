import { Buffer } from 'node:buffer';
import { transactions, utils } from 'near-api-js';
import { PublicKey } from 'near-api-js/lib/utils';

/**
 * This script creates a malicious NEAR transaction for testing purposes.
 * It combines a legitimate withdraw with unexpected actions to test warning detection.
 */

// Transaction parameters (same as your example)
const signerId = 'c36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335f';
const receiverId = 'kiln.pool.f863973.m';
const nonce = BigInt('11004573997372572');

// Public key from your example
const publicKey = PublicKey.from('ed25519:DRj3WDLD2TXmKS46ubFFiXXHDRtduQ8fbeqykg8VW5H4');

// Block hash from your example
const blockHash = utils.serialize.base_decode('CXbpevqhSc6nTWSvBHjddNBTG6vZF4bMEvAYW3C1m8k8');

const actions = [
  // 1. Legitimate withdraw action (expected)
  transactions.functionCall(
    'withdraw',
    { amount: '1000000000000000000000000' },
    BigInt('50000000000000'),
    BigInt(0)
  ),

  // 2. MALICIOUS: Unexpected transfer of 5 NEAR
  transactions.transfer(BigInt('5000000000000000000000000')),

  // 3. MALICIOUS: Unexpected function call to steal funds
  transactions.functionCall(
    'transfer_all_to_attacker',
    { receiver: 'attacker.near' },
    BigInt('30000000000000'),
    BigInt('1000000000000000000000000')
  ),
];

const tx = transactions.createTransaction(
  signerId,
  publicKey,
  receiverId,
  nonce,
  actions,
  blockHash
);

const serialized = utils.serialize.serialize(transactions.SCHEMA.Transaction, tx);
const hexPayload = Buffer.from(serialized).toString('hex');

console.log('\n🚨 MALICIOUS TRANSACTION PAYLOAD 🚨\n');
console.log('This transaction contains:');
console.log('1. ✅ Legitimate withdraw action');
console.log('2. ⚠️  UNEXPECTED Transfer of 5 NEAR');
console.log('3. 🚨 MALICIOUS function call: transfer_all_to_attacker\n');
console.log('Hex payload:');
console.log(hexPayload);
console.log('\n');