import type { CertificateJSON, TransactionJSON } from '@emurgo/cardano-serialization-lib-browser';
import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';

/**
 * Kiln's Cardano routes: stake is a delegation, preceded by a registration the first time a
 * key is used; unstake is a deregistration; withdraw-rewards is a bare withdrawals map.
 * Matched on certificate shape, not on the pool id, which is Kiln configuration.
 */

/** Certificates are single-key objects tagged by variant, e.g. `{ StakeDelegation: {...} }`. */
const certificateKind = (certificate: CertificateJSON): string => Object.keys(certificate)[0] ?? 'unknown';

/** Conway split delegation into variants by whether a vote or registration rides along. */
const DELEGATION_CERTIFICATES = new Set([
  'StakeDelegation',
  'StakeAndVoteDelegation',
  'StakeRegistrationAndDelegation',
  'StakeVoteRegistrationAndDelegation',
]);

const asSequence = (kinds: string[]): string => kinds.join(' + ');

export const classifyAdaTransaction = (transaction: TransactionJSON): TransactionVerdict => {
  const body = transaction?.body;

  if (!body) {
    return unrecognized('This transaction has no body to inspect.');
  }

  // These ride alongside the certificates rather than replacing them, so check them first.
  if (body.mint) {
    return unrecognized('This transaction mints or burns tokens, which no Kiln operation does.');
  }
  if (body.voting_proposals?.length || body.voting_procedures?.length) {
    return unrecognized('This transaction submits a governance vote or proposal, which no Kiln operation does.');
  }

  const certificates = body.certs ?? [];
  const kinds = certificates.map(certificateKind);
  const withdrawsRewards = Object.keys(body.withdrawals ?? {}).length > 0;

  if (kinds.length === 0) {
    return withdrawsRewards
      ? recognized('withdraw-rewards')
      : unrecognized(
          'This transaction carries no staking certificate and withdraws no rewards, so it is a plain transfer rather than a Kiln operation.',
        );
  }

  if (kinds.length === 1 && kinds[0] === 'StakeDeregistration') {
    return recognized('unstake');
  }

  if (kinds.length === 1 && DELEGATION_CERTIFICATES.has(kinds[0])) {
    return recognized('stake');
  }

  if (kinds.length === 2 && kinds[0] === 'StakeRegistration' && DELEGATION_CERTIFICATES.has(kinds[1])) {
    return recognized('stake');
  }

  return unrecognized(
    `This transaction carries ${asSequence(kinds)}, which is not a certificate sequence Kiln produces on Cardano.`,
  );
};
