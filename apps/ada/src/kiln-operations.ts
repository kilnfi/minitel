import type { CertificateJSON, TransactionJSON } from '@emurgo/cardano-serialization-lib-browser';
import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';

/**
 * The Cardano operations Kiln crafts, and the certificates each one carries.
 *
 * Source of truth is Kiln's transaction-crafting API, which the public Kiln Connect spec
 * exposes as `/ada/transaction/{stake,unstake,withdraw-rewards}`:
 *
 * - stake — a stake-and-vote delegation, preceded by a stake registration the first time the
 *   key is used. A key already registered is delegated without re-registering, so both the
 *   one- and two-certificate forms are genuine.
 * - unstake — a stake deregistration, which also sweeps the outstanding rewards, so the
 *   withdrawals map is populated alongside the certificate.
 * - withdraw-rewards — a withdrawals map and no certificate at all.
 *
 * Matching is on certificate shape, not on the pool being delegated to. The pool id lives in
 * Kiln's configuration and changes without minitel knowing; baking it in here would produce a
 * list that goes stale and starts rejecting real transactions. The decoded summary below the
 * verdict is where the user checks which pool they are delegating to.
 */

/** Certificates are single-key objects tagged by variant, e.g. `{ StakeDelegation: {...} }`. */
const certificateKind = (certificate: CertificateJSON): string => Object.keys(certificate)[0] ?? 'unknown';

/**
 * The delegation certificates Kiln's stake route may produce. The Conway era split delegation
 * into several variants depending on whether a governance vote is delegated at the same time,
 * and whether registration is folded into the same certificate.
 */
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

  // A staking operation never mints or burns, and never carries governance proposals. These
  // ride alongside the certificates rather than replacing them, so they are checked first.
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
