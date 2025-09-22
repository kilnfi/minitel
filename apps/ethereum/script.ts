import type { TransactionSerializable } from 'viem';
import { serializeTransaction } from 'viem';

// Approve transaction
const approveTransaction = {
  to: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as `0x${string}`,
  nonce: 54,
  maxPriorityFeePerGas: 2000000000n, // 2 Gwei
  maxFeePerGas: 383687469748n,
  gas: 116072n,
  value: 0n,
  data: '0x095ea7b3000000000000000000000000ca8f5dbc4c90678763b291217e6dddfca00341d00000000000000000000000000000000000000000000000000000000000000001' as `0x${string}`,
  chainId: 42161,
  authorizationList: [],
} as TransactionSerializable;

// Deposit transaction
const depositTransaction = {
  to: '0xCA8F5dbC4c90678763B291217e6ddDfcA00341d0' as `0x${string}`,
  nonce: 19,
  maxPriorityFeePerGas: 2000000000n, // 2 Gwei
  maxFeePerGas: 383687469748n,
  gas: 692134n,
  value: 0n,
  data: '0x6e553f650000000000000000000000000000000000000000000000000000000000000005000000000000000000000000ca5c9efb78f0d608f9562c0ae5352a61e417ee2d' as `0x${string}`,
  chainId: 42161,
  authorizationList: [],
} as TransactionSerializable;

// Withdraw (custom amount) transaction
const withdrawCustomTransaction = {
  to: '0xCA8F5dbC4c90678763B291217e6ddDfcA00341d0' as `0x${string}`,
  nonce: 54,
  maxPriorityFeePerGas: 2000000000n, // 2 Gwei
  maxFeePerGas: 383687469748n,
  gas: 573690n,
  value: 0n,
  data: '0xb460af9400000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000991c468abce2b4dd627a6210c145373ebabdd186000000000000000000000000991c468abce2b4dd627a6210c145373ebabdd186' as `0x${string}`,
  chainId: 42161,
  authorizationList: [],
} as TransactionSerializable;

// Withdraw (max amount) transaction
const withdrawMaxTransaction = {
  to: '0xCA8F5dbC4c90678763B291217e6ddDfcA00341d0' as `0x${string}`,
  nonce: 54,
  maxPriorityFeePerGas: 2000000000n, // 2 Gwei
  maxFeePerGas: 383687469748n,
  gas: 559038n,
  value: 0n,
  data: '0xba0876520000000000000000000000000000000000000000000000000000000000002ca6000000000000000000000000991c468abce2b4dd627a6210c145373ebabdd186000000000000000000000000991c468abce2b4dd627a6210c145373ebabdd186' as `0x${string}`,
  chainId: 42161,
  authorizationList: [],
} as TransactionSerializable;

console.log('=== APPROVE TRANSACTION ===');
const serializedApprove = serializeTransaction(approveTransaction);
console.log(serializedApprove);

console.log('\n=== DEPOSIT TRANSACTION ===');
const serializedDeposit = serializeTransaction(depositTransaction);
console.log(serializedDeposit);

console.log('\n=== WITHDRAW CUSTOM AMOUNT TRANSACTION ===');
const serializedWithdrawCustom = serializeTransaction(withdrawCustomTransaction);
console.log(serializedWithdrawCustom);

console.log('\n=== WITHDRAW MAX AMOUNT TRANSACTION ===');
const serializedWithdrawMax = serializeTransaction(withdrawMaxTransaction);
console.log(serializedWithdrawMax);
