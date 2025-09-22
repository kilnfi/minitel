import type { PlaybookOperation } from '@protocols/shared';

export const ETHEREUM_PLAYBOOK_OPERATIONS: PlaybookOperation[] = [
  {
    label: 'Approve ERC-20 Token',
    value: 'erc20-approve',
    description: 'Approve spending of ERC-20 tokens by a smart contract',
    rawTransaction:
      '0x04f87182a4b13684773594008559558e2ab48301c56894af88d065e77c8cc2239327c5edb3a432268e583180b844095ea7b3000000000000000000000000ca8f5dbc4c90678763b291217e6dddfca00341d00000000000000000000000000000000000000000000000000000000000000001c0c0',
    operationOverview: [
      {
        type: 'text',
        content: '⚠️ HIGH RISK TRANSACTION: This approval grants permission to a smart contract to spend your tokens.',
      },
      {
        type: 'text',
        content:
          'You are approving 1 token to be spent by address 0xCA8F...41d0. Make sure you trust this contract address before proceeding.',
      },
    ],
    stepByStep: [
      {
        title: 'Token Approval',
        program: 'ERC-20 Contract (0xaf88d0...8e5831)',
        description: 'Grants spending permission of 1 token to address 0xCA8F...41d0. Maximum gas fee: 383.69 Gwei',
      },
    ],
  },
  {
    label: 'Deposit Funds',
    value: 'deposit',
    description: 'Deposit funds into a DeFi protocol',
    rawTransaction:
      '0x04f87182a4b11384773594008559558e2ab4830a8fa694ca8f5dbc4c90678763b291217e6dddfca00341d080b8446e553f650000000000000000000000000000000000000000000000000000000000000005000000000000000000000000ca5c9efb78f0d608f9562c0ae5352a61e417ee2dc0c0',
    operationOverview: [
      {
        type: 'text',
        content: '⚠️ HIGH RISK TRANSACTION: This deposit will lock your funds in a smart contract.',
      },
      {
        type: 'text',
        content:
          'You are depositing 0 ETH to contract address 0xca8f...41d0. The funds will be sent to recipient 0xCa5C...Ee2d.',
      },
    ],
    stepByStep: [
      {
        title: 'Deposit',
        program: 'DeFi Protocol (0xca8f5d...0341d0)',
        description: 'Deposits funds with amount parameter 5 to recipient 0xCa5C...Ee2d. Maximum gas fee: 383.69 Gwei',
      },
    ],
  },
  {
    label: 'Withdraw Custom Amount',
    value: 'withdraw-custom',
    description: 'Withdraw a specific amount from a DeFi protocol',
    rawTransaction:
      '0x04f89182a4b13684773594008559558e2ab48308c0fa94ca8f5dbc4c90678763b291217e6dddfca00341d080b864b460af9400000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000991c468abce2b4dd627a6210c145373ebabdd186000000000000000000000000991c468abce2b4dd627a6210c145373ebabdd186c0c0',
    operationOverview: [
      {
        type: 'text',
        content: '⚠️ HIGH RISK TRANSACTION: This withdrawal will remove funds from a smart contract.',
      },
      {
        type: 'text',
        content:
          'You are withdrawing 1000 tokens from contract 0xca8f...41d0. The funds will be sent to recipient 0x991c...d186.',
      },
    ],
    stepByStep: [
      {
        title: 'Withdraw Specific Amount',
        program: 'DeFi Protocol (0xca8f5d...0341d0)',
        description: 'Withdraws 1000 tokens to recipient 0x991c...d186. Maximum gas fee: 383.69 Gwei',
      },
    ],
  },
  {
    label: 'Withdraw Maximum Amount',
    value: 'withdraw-max',
    description: 'Withdraw all available funds from a DeFi protocol',
    rawTransaction:
      '0x04f89182a4b13684773594008559558e2ab4830887be94ca8f5dbc4c90678763b291217e6dddfca00341d080b864ba0876520000000000000000000000000000000000000000000000000000000000002ca6000000000000000000000000991c468abce2b4dd627a6210c145373ebabdd186000000000000000000000000991c468abce2b4dd627a6210c145373ebabdd186c0c0',
    operationOverview: [
      {
        type: 'text',
        content: '⚠️ HIGH RISK TRANSACTION: This redemption will remove all your funds from the smart contract.',
      },
      {
        type: 'text',
        content:
          'You are redeeming 11,430 tokens from contract 0xca8f...41d0. The funds will be sent to recipient 0x991c...d186.',
      },
    ],
    stepByStep: [
      {
        title: 'Redeem All Funds',
        program: 'DeFi Protocol (0xca8f5d...0341d0)',
        description: 'Redeems 11,430 tokens to recipient 0x991c...d186. Maximum gas fee: 383.69 Gwei',
      },
    ],
  },
];
