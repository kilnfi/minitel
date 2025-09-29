import type { PlaybookOperation } from '@protocols/shared';

export const SOLANA_PLAYBOOK_OPERATIONS: PlaybookOperation[] = [
  {
    label: 'Create a stake',
    value: 'create-stake',
    description: 'Create a stake',
    rawTransaction: `03000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005f6f5dec93785de5b8ffbfe9d27d493bc793dee148f7d066b80d265e709c3f756a89da06b2866e823533b1b25d4328b9ede28ffa43cfdb886f51508d23126c0f660187441080219f6a4f8164d4f1cf762b451e5448f5887fc8ae03dc0d5d9dd6508b08e03adae6e77d559f630b5e6185162b22d7a0e5d00a973f9d5e1c176f0f0301090dc36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335f6cd1475b985d2ec56a0ca68fded600e6567552d79002d6b081055d4afe37cf8fc8049a6d5db05491ef846800fa7afef819d9be2f67273bf551d5c779eb73999e420f7c14c17ce83dc2a5f6e8f609f01bb8c337c35bf171b6a38d74274a17123400000000000000000000000000000000000000000000000000000000000000000306466fe5211732ffecadba72c39be7bc8ce5bbc5f7126b2c439b3a40000000ddf42a04800a54de2e583f94f17b089725b772d1333526271241532776d2ffc606a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a1d817a502050b680791e6ce6db88e1e5b7150f61fc6790a4eb4d10000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea940000006a7d517192c5c51218cc94c3d4af17f58daee089ba1fd44e3dbd98a0000000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff4000000780424502b8e69ed59476234d4ff518e77a69e03570bdefd2017dc4389fc9643060403030a02040400000004020001340000000081d5220000000000c80000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc0000000000702010b7400000000c36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335fc36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007060106090c080004020000000500050276900000050009030000000000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction advances a nonce account, creates a new stake account with 2282881 lamports, initializes it with staker and withdrawer authorities, and delegates it to a validator. It also sets compute unit parameters.',
      },
    ],
    stepByStep: [
      {
        title: 'AdvanceNonceAccount',
        program: 'System Program',
        description: 'Advances nonce account 5SsbxnyF...Rsjm2T by authority ETncRJhQ...48Zhc1',
      },
      {
        title: 'Create',
        program: 'System Program',
        description:
          'Creates account 8Kn7smBs...o1FDVQ funded by E9qDxpwu...bAevuC with 2282881 lamports (200 bytes, owned by Stake Program)',
      },
      {
        title: 'Initialize',
        program: 'Stake Program',
        description:
          'Initializes stake account 8Kn7smBs...o1FDVQ with E9qDxpwu...bAevuC as both staker and withdrawer authority',
      },
      {
        title: 'Delegate',
        program: 'Stake Program',
        description:
          'Delegates stake account 8Kn7smBs...o1FDVQ to validator FwR3PbjS...XtT59f by authority E9qDxpwu...bAevuC',
      },
      {
        title: 'SetComputeUnitLimit',
        program: 'Compute Budget Program',
        description: 'Sets transaction-wide compute unit limit to 36982 units',
      },
      {
        title: 'SetComputeUnitPrice',
        program: 'Compute Budget Program',
        description: 'Sets transaction compute unit price to 0 microlamports for prioritization fees',
      },
    ],
  },
  {
    label: 'Split a stake',
    value: 'split-stake',
    description: 'Split a stake',
    rawTransaction: `03000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000087af2559608bdd7d9aa5e02ba7ec7f3d60bdbffb6d8a90ff209ef5f6b70a52ed32d08fee6ead39144c8d1c35db42620360501ce26bc2a646f745588f829f600d03010409f4f508da6f36cfb48764d88b2f49638326de40822a623c361188042750ab0d26a4c21effcb7f70952fc218f6d20a8728514bdfd108cc1513f3af91400ba68174c8049a6d5db05491ef846800fa7afef819d9be2f67273bf551d5c779eb73999e32ef666b1886346c22d83c273b07fc6b2759635912d8ab1c08827d40a323ffc6bffdb05f6fae1cddadcf50e12449dda2a4728476351ab6c2364e61befaef4e1900000000000000000000000000000000000000000000000000000000000000000306466fe5211732ffecadba72c39be7bc8ce5bbc5f7126b2c439b3a4000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea940000072c8c598b2889136d7022b8250fd641349cd256293475f3ce32b183dc013c78d050503040802040400000005020001340000000080d5220000000000c80000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000007030301000c0300000040420f000000000006000502c0d4010006000903a086010000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction consists of five instructions that: Advance a nonce account for transaction uniqueness, create a new stake account (funded with rent-exempt reserve), split stake from an existing account, and configure compute settings for transaction execution. The split moves 1,000,000 lamports from the source stake account into the newly created stake account.',
      },
    ],
    stepByStep: [
      {
        title: 'Advance Nonce',
        program: 'System Program',
        description:
          'Advances the nonce account to ensure transaction uniqueness, authorized by the nonce account authority.',
      },
      {
        title: 'Create',
        program: 'System Program',
        description:
          'Creates a new stake account with 2,282,880 lamports for rent exemption (200 bytes), owned by the Stake program.',
      },
      {
        title: 'Split',
        program: 'Stake Program',
        description:
          'Splits 1,000,000 lamports from the source stake account into the newly created stake account. The new stake account inherits the authorities and delegation state of the source account.',
      },
      {
        title: 'Set Compute Unit Limit',
        program: 'Compute Budget Program',
        description: 'Sets a transaction-wide compute unit limit of 120,000 units.',
      },
      {
        title: 'Set Compute Unit Price',
        program: 'Compute Budget Program',
        description: 'Sets the compute unit price to 100,000 microlamports for transaction prioritization.',
      },
    ],
  },
  {
    label: 'Withdraw a stake',
    value: 'withdraw-stake',
    description: 'Withdraw a stake',
    rawTransaction: `0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e3bb3580eab9c078dddf949fc53541da557cce54233bae4f20d60733c03e2e9be0a217b073773d6879dcb95b5b3b0bdc463962d1a30e8dcaa27b915c4f07e7060201060ac36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335fc8049a6d5db05491ef846800fa7afef819d9be2f67273bf551d5c779eb73999e32ef666b1886346c22d83c273b07fc6b2759635912d8ab1c08827d40a323ffc60267c9719a63a3dd78d725164a88b0739d151afbec5c2c9cb0d8539389767ece00000000000000000000000000000000000000000000000000000000000000000306466fe5211732ffecadba72c39be7bc8ce5bbc5f7126b2c439b3a4000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea940000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff40000007819830bc88aff2b950d2e1faf0e6313096a32a1fe71f3f86d9758c333ea25550404030308010404000000060502000709000c0400000040420f000000000005000502c0d4010005000903a086010000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction consists of four instructions that: Advance a nonce account for transaction uniqueness, withdraw 1,000,000 lamports (0.001 SOL) from a stake account, and configure compute settings for transaction execution.',
      },
    ],
    stepByStep: [
      {
        title: 'Advance Nonce',
        program: 'System Program',
        description:
          'Advances the nonce account to ensure transaction uniqueness, authorized by the nonce account authority.',
      },
      {
        title: 'Withdraw',
        program: 'Stake Program',
        description:
          'Withdraws 1,000,000 lamports from the stake account to the recipient account, authorized by the withdraw authority.',
      },
      {
        title: 'Set Compute Unit Limit',
        program: 'Compute Budget Program',
        description: 'Sets a transaction-wide compute unit limit of 120,000 units.',
      },
      {
        title: 'Set Compute Unit Price',
        program: 'Compute Budget Program',
        description: 'Sets the compute unit price to 100,000 microlamports for transaction prioritization.',
      },
    ],
  },
  {
    label: 'Deactivate a stake',
    value: 'deactivate-stake',
    description: 'Deactivate a stake',
    rawTransaction: `0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e5fa1c1f2773ac59621a16178adef20f6d057e12fe431bc3bf98b00418d3700f640a002c01b86c16bbcee318393db2ce9f668518c64feba418b83b221cc3dd0d02010509c36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335fc8049a6d5db05491ef846800fa7afef819d9be2f67273bf551d5c779eb73999e32ef666b1886346c22d83c273b07fc6b2759635912d8ab1c08827d40a323ffc60267c9719a63a3dd78d725164a88b0739d151afbec5c2c9cb0d8539389767ece00000000000000000000000000000000000000000000000000000000000000000306466fe5211732ffecadba72c39be7bc8ce5bbc5f7126b2c439b3a4000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea94000007819830bc88aff2b950d2e1faf0e6313096a32a1fe71f3f86d9758c333ea255504040303080104040000000603020700040500000005000502c0d4010005000903a086010000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction consists of four instructions that: Advance a nonce account for transaction uniqueness, deactivate a stake account to begin the undelegation process, and configure compute settings for transaction execution.',
      },
    ],
    stepByStep: [
      {
        title: 'Advance Nonce',
        program: 'System Program',
        description:
          'Advances the nonce account to ensure transaction uniqueness, authorized by the nonce account authority.',
      },
      {
        title: 'Deactivate',
        program: 'Stake Program',
        description:
          'Initiates the deactivation of the stake account, authorized by the stake authority. This begins the undelegation process.',
      },
      {
        title: 'Set Compute Unit Limit',
        program: 'Compute Budget Program',
        description: 'Sets a transaction-wide compute unit limit of 120,000 units.',
      },
      {
        title: 'Set Compute Unit Price',
        program: 'Compute Budget Program',
        description: 'Sets the compute unit price to 100,000 microlamports for transaction prioritization.',
      },
    ],
  },
  {
    label: 'Merge stakes',
    value: 'merge-stakes',
    description: 'Merge stakes',
    rawTransaction: `0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0621e9ee482265dc89be9d2b09187c357e65958c762545b06f065679beea68064becf14b0802a594c77bb66b85d08660017319442c08e90f3ad1d577eccfa080201060b285c1a6d9160afb383452ca35c7119cabac84df611944a44bebd577b5c314de7c8049a6d5db05491ef846800fa7afef819d9be2f67273bf551d5c779eb73999e32ef666b1886346c22d83c273b07fc6b2759635912d8ab1c08827d40a323ffc66acae2200af9026c48e8169d52766baf6cec40f997f92acf66f01f6b24e444ab9c821ee8465c407ae87cecac26646ecd0d1ef4cb2ed658803c7734f31dfdac8100000000000000000000000000000000000000000000000000000000000000000306466fe5211732ffecadba72c39be7bc8ce5bbc5f7126b2c439b3a4000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000006a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea940000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff400000072c8c598b2889136d7022b8250fd641349cd256293475f3ce32b183dc013c78d040503040901040400000007050302080a00040700000006000502c0d4010006000903a086010000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          'This transaction consists of four instructions that: Advance a nonce account for transaction uniqueness, merge a source stake account into a destination stake account, and configure compute settings for transaction execution.',
      },
    ],
    stepByStep: [
      {
        title: 'Advance Nonce',
        program: 'System Program',
        description:
          'Advances the nonce account to ensure transaction uniqueness, authorized by the nonce account authority.',
      },
      {
        title: 'Merge',
        program: 'Stake Program',
        description:
          'Combines the source stake account into the destination stake account, authorized by the stake authority. After the merge, the destination account holds the combined stake while the source account is emptied and deallocated.',
      },
      {
        title: 'Set Compute Unit Limit',
        program: 'Compute Budget Program',
        description: 'Sets a transaction-wide compute unit limit of 120,000 units.',
      },
      {
        title: 'Set Compute Unit Price',
        program: 'Compute Budget Program',
        description: 'Sets the compute unit price to 100,000 microlamports for transaction prioritization.',
      },
    ],
  },
  {
    label: '⚠️ Malicious Stake Authority Transfer',
    value: 'stake-authority-transfer',
    description: 'Example of stake account creation and authority transfer',
    rawTransaction: `03000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006dbed50bab859088ef95ffb620a15fc1c4f9ea9f44556228ac4ae92dc1e8c8e15dda2889ca7673bcc4315979054c12be054f010bbe58bc997bce8bb4f56ea8067724e2a41a80ceac49132ffb0f1f25c556793ebe8960bdbe72f9b76b78c154925de27908be04372754d4ef6b48f5e9f0c439ec336ed6e4b08e24169b063342050301080dc36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335f8061f75dde26f1edb86fad8ac324809a47a7bc8825d0a591286bc7135d8169eec8049a6d5db05491ef846800fa7afef819d9be2f67273bf551d5c779eb73999e0267c9719a63a3dd78d725164a88b0739d151afbec5c2c9cb0d8539389767ece06a7d51718c774c928566398691d5eb68b5eb8a39b4b6d5c73555b210000000000000000000000000000000000000000000000000000000000000000000000000306466fe5211732ffecadba72c39be7bc8ce5bbc5f7126b2c439b3a40000000ddf42a04800a54de2e583f94f17b089725b772d1333526271241532776d2ffc606a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc00000000006a1d817a502050b680791e6ce6db88e1e5b7150f61fc6790a4eb4d10000000006a7d517192c568ee08a845f73d29788cf035c3145b21ab344d8062ea940000006a7d517192c5c51218cc94c3d4af17f58daee089ba1fd44e3dbd98a0000000006a7d517193584d0feed9bb3431d13206be544281b57b8566cc5375ff40000007819830bc88aff2b950d2e1faf0e6313096a32a1fe71f3f86d9758c333ea2555070503030a02040400000005020001340000000081d5220000000000c80000000000000006a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc0000000000802010b7400000000c36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335fc36b1a5da2e60d1fd5d3a6b46f7399eb26571457f3272f3c978bc9527ad2335f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008060107040c0900040200000008040104000028010000000f66d21220ef2f2d89aa00d02d17cb05b6b7db8f29ac4778b18def0f0c394127000000000600050294d80000060009030000000000000000`,
    operationOverview: [
      {
        type: 'text',
        content:
          '⚠️ WARNING: This transaction creates a new stake account and transfers its staker authority to a different address. It includes an advance nonce operation, account creation, stake initialization, delegation, and authority transfer.',
      },
    ],
    stepByStep: [
      {
        title: 'AdvanceNonceAccount',
        program: 'System Program',
        description: 'Advance nonce account APc6Nusd...H4DPiV by authority ETncRJhQ...48Zhc1',
      },
      {
        title: 'Create',
        program: 'System Program',
        description: 'Create account 9e9pyeeP...rrXz8u funded by E9qDxpwu...bAevuC with 2282881 lamports',
      },
      {
        title: 'Initialize',
        program: 'Stake Program',
        description:
          'Initialize stake account 9e9pyeeP...rrXz8u with staker and withdrawer authority E9qDxpwu...bAevuC',
      },
      {
        title: 'Delegate',
        program: 'Stake Program',
        description:
          'Delegate stake account 9e9pyeeP...rrXz8u to validator FwR3PbjS...XtT59f by authority E9qDxpwu...bAevuC',
      },
      {
        title: 'Authorize',
        program: 'Stake Program',
        description: `Set Staker authority from E9qDxpwu...bAevuC to 2383vwQj...vCrucr on stake account 9e9pyeeP...rrXz8u \n ⚠️ Not standard instruction for stake transaction`,
      },
      {
        title: 'SetComputeUnitLimit',
        program: 'Compute Budget Program',
        description: 'Transaction-wide compute unit limit: 55444 units',
      },
      {
        title: 'SetComputeUnitPrice',
        program: 'Compute Budget Program',
        description: 'Transaction compute unit price: 0 microlamports',
      },
    ],
  },
];
