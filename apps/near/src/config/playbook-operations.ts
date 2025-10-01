import type { PlaybookOperation } from '@protocols/shared';

export const NEAR_PLAYBOOK_OPERATIONS: PlaybookOperation[] = [
  {
    label: 'Stake NEAR',
    value: 'stake-near',
    description: 'Deposit and stake NEAR tokens to a validator pool',
    rawTransaction: `400000006333366231613564613265363064316664356433613662343666373339396562323635373134353766333237326633633937386263393532376164323333356600c36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335faac2dad0ea920000140000006b696c6e2e706f6f6c2e663836333937332e6d304f69b6b4e9906871f3988e42eb78b155f0be56961d5423b4f5bfc8962387b4ff0100000002110000006465706f7369745f616e645f7374616b65020000007b7d00c06e31d9100100000080f64ae1c7022d15000000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction contains 1 action that stakes 0.1 NEAR to the validator pool kiln.pool.f863973.m0. The transaction is sent from c36b1a5d...d2335f with nonce 92ead0dac2aa and public key ed25519:E9qDxpwuPFeFB7vDdDibdCbWwHy867eYz3rV29bAevuC.',
      },
    ],
    stepByStep: [
      {
        title: 'Function Call: Stake',
        program: 'Staking Pool Contract',
        description:
          'Calls deposit_and_stake() on kiln.pool.f863973.m0 with 0.1 NEAR (100000000000000000000000 yoctoNEAR) deposit and 300 TGas (300000000000000 gas)',
      },
    ],
  },
  {
    label: 'Unstake NEAR',
    value: 'unstake-near',
    description: 'Unstake NEAR tokens from a validator pool',
    rawTransaction: `400000006333366231613564613265363064316664356433613662343666373339396562323635373134353766333237326633633937386263393532376164323333356600c36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335fadc2dad0ea920000140000006b696c6e2e706f6f6c2e663836333937332e6d30e847e0ee14e5c573f6f618e971e56ef710991c5b27c9523d20ce496c64ad5a69010000000207000000756e7374616b65250000007b22616d6f756e74223a22313030303030303030303030303030303030303030303030227d00c06e31d910010000000000000000000000000000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction contains 1 action that unstakes 0.1 NEAR from the validator pool kiln.pool.f863973.m0. The transaction is sent from c36b1a5d...d2335f with nonce 92ead0dac2ad and public key ed25519:E9qDxpwuPFeFB7vDdDibdCbWwHy867eYz3rV29bAevuC.',
      },
    ],
    stepByStep: [
      {
        title: 'Function Call: Unstake',
        program: 'Staking Pool Contract',
        description:
          'Calls unstake({"amount":"100000000000000000000000"}) on kiln.pool.f863973.m0 with 0 NEAR deposit and 300 TGas (300000000000000 gas)',
      },
    ],
  },
  {
    label: 'Withdraw NEAR',
    value: 'withdraw-near',
    description: 'Withdraw unstaked NEAR tokens from a validator pool',
    rawTransaction: `400000006333366231613564613265363064316664356433613662343666373339396562323635373134353766333237326633633937386263393532376164323333356600c36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335fadc2dad0ea920000140000006b696c6e2e706f6f6c2e663836333937332e6d30c0a605de064995ec1eaa153b426e91f865a579b168e0a68c4fe17ca39c03d6d00100000002080000007769746864726177260000007b22616d6f756e74223a2231303030303030303030303030303030303030303030303030227d00c06e31d910010000000000000000000000000000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction contains 1 action that withdraws 1 NEAR from the validator pool kiln.pool.f863973.m0. The transaction is sent from c36b1a5d...d2335f with nonce 92ead0dac2ad and public key ed25519:E9qDxpwuPFeFB7vDdDibdCbWwHy867eYz3rV29bAevuC.',
      },
    ],
    stepByStep: [
      {
        title: 'Function Call: Withdraw',
        program: 'Staking Pool Contract',
        description:
          'Calls withdraw({"amount":"1000000000000000000000000"}) on kiln.pool.f863973.m0 with 0 NEAR deposit and 300 TGas (300000000000000 gas)',
      },
    ],
  },
];
