import { DOT } from '@protocols/shared';
import { createSubstrateAdapter } from '@protocols/substrate-shared';

export const dotAdapter = createSubstrateAdapter({
  protocol: DOT,
  name: 'dot',
  displayName: 'Polkadot',
  token: 'DOT',
});
