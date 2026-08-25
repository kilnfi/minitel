import { recognized, type TransactionVerdict, unrecognized } from '@protocols/shared';
import type { CosmosMessage, CosmosTransaction } from './parser';

/**
 * The Cosmos operations Kiln crafts, per chain.
 *
 * Source of truth is Kiln's transaction-crafting API and the public Kiln Connect spec, which expose the same set:
 * `/{chain}/transaction/{stake,unstake,redelegate,withdraw-rewards,restake-rewards,
 * revoke-restake-rewards,send,noble-ibc-transfer}`. Not every chain exposes all of them, which
 * is exactly why this is keyed per chain rather than shared: a `send` on Cosmos Hub or a
 * restake grant on Injective is not something Kiln produces, and saying so is the point.
 *
 * Every one of those routes builds a single message, with one exception — `stake` with
 * `restake_rewards` set builds a MsgDelegate followed by a MsgGrant — so a genuine Kiln
 * transaction is one message, or that specific pair.
 *
 * Matching is on message shape, not on Kiln's own validator or grantee addresses. Those live
 * in Kiln's configuration and change without minitel knowing; baking them in here would
 * produce a list that silently goes stale and starts rejecting real transactions, which erodes
 * trust in the verdict just as badly as accepting a bad one. The decoded summary below the
 * verdict is where the user checks which validator they are delegating to.
 */

/** Chains minitel ships a Cosmos decoder for. */
export type CosmosChainName =
  | 'atom'
  | 'cronos'
  | 'dydx'
  | 'fetch'
  | 'injective'
  | 'kava'
  | 'osmosis'
  | 'sei'
  | 'tia'
  | 'zeta';

export type CosmosOperation =
  | 'stake'
  | 'unstake'
  | 'redelegate'
  | 'withdraw-rewards'
  | 'restake-rewards'
  | 'revoke-restake-rewards'
  | 'send'
  | 'ibc-transfer';

/**
 * Kava and ZetaChain are deliberately empty: Kiln Connect removed every `/kava/*` and
 * `/zeta/*` endpoint in API v1.10, so there is no such thing as a Kiln transaction on those
 * chains any more and nothing minitel can vouch for. The apps are candidates for removal the
 * way DOT, KSM and Mantra were.
 */
const KILN_OPERATIONS_BY_CHAIN: Record<CosmosChainName, ReadonlySet<CosmosOperation>> = {
  atom: new Set(['stake', 'unstake', 'redelegate', 'withdraw-rewards', 'restake-rewards', 'revoke-restake-rewards']),
  cronos: new Set([
    'stake',
    'unstake',
    'redelegate',
    'withdraw-rewards',
    'restake-rewards',
    'revoke-restake-rewards',
    'send',
  ]),
  // dYdX pays rewards in USDC on Noble, so it alone exposes an IBC transfer route.
  dydx: new Set(['stake', 'unstake', 'redelegate', 'withdraw-rewards', 'ibc-transfer']),
  fetch: new Set([
    'stake',
    'unstake',
    'redelegate',
    'withdraw-rewards',
    'restake-rewards',
    'revoke-restake-rewards',
    'send',
  ]),
  injective: new Set(['stake', 'unstake', 'redelegate', 'withdraw-rewards']),
  kava: new Set([]),
  osmosis: new Set(['stake', 'unstake', 'redelegate', 'withdraw-rewards', 'restake-rewards', 'revoke-restake-rewards']),
  sei: new Set(['stake', 'unstake', 'redelegate', 'withdraw-rewards', 'send']),
  tia: new Set(['stake', 'unstake', 'redelegate', 'withdraw-rewards', 'restake-rewards', 'revoke-restake-rewards']),
  zeta: new Set([]),
};

/** The message Kiln's revoke-restake-rewards route revokes authorization for. */
const DELEGATE_MSG_TYPE_URL = '/cosmos.staking.v1beta1.MsgDelegate';

/** A rejection carrying the reason, or the operation a message set resolves to. */
type Match = { operation: CosmosOperation } | { rejection: string };

const isRejection = (match: Match): match is { rejection: string } => 'rejection' in match;

/**
 * Kiln's restake grant authorizes one thing: delegating to a named validator on the user's
 * behalf. A StakeAuthorization can just as easily authorize undelegation or redelegation, and
 * a grant of some other authorization type can authorize anything at all — none of which is
 * visible from the `MsgGrant` typeUrl the summary shows.
 */
const matchRestakeGrant = (message: Extract<CosmosMessage, { kind: 'authzGrant' }>): Match => {
  const { stakeAuthorization } = message;

  if (!stakeAuthorization) {
    return {
      rejection: `This transaction grants ${message.grantee} a ${message.authorizationType} authorization. Kiln only grants a staking authorization to restake rewards.`,
    };
  }

  if (stakeAuthorization.authorizationType !== 'delegate') {
    return {
      rejection: `This transaction authorizes ${message.grantee} to ${stakeAuthorization.authorizationType} on your behalf. Kiln's restake-rewards grant only authorizes delegation.`,
    };
  }

  return { operation: 'restake-rewards' };
};

const matchMessage = (message: CosmosMessage): Match => {
  switch (message.kind) {
    case 'delegate':
      return { operation: 'stake' };
    case 'undelegate':
      return { operation: 'unstake' };
    case 'redelegate':
      return { operation: 'redelegate' };
    case 'withdrawRewards':
      return { operation: 'withdraw-rewards' };
    case 'send':
      return { operation: 'send' };
    case 'ibcTransfer':
      return { operation: 'ibc-transfer' };
    case 'authzGrant':
      return matchRestakeGrant(message);
    case 'authzRevoke':
      return message.msgTypeUrl === DELEGATE_MSG_TYPE_URL
        ? { operation: 'revoke-restake-rewards' }
        : {
            rejection: `This transaction revokes a ${message.msgTypeUrl} authorization. Kiln only revokes the delegation authorization it granted to restake rewards.`,
          };
    case 'authzExec':
      return {
        rejection: `This transaction lets ${message.grantee} execute ${message.innerTypeUrls.length} message(s) on your behalf. Kiln never crafts an authz exec.`,
      };
    default:
      return {
        rejection: `This transaction contains a ${message.typeUrl || 'nameless'} message minitel could not decode.`,
      };
  }
};

/**
 * A single stake route emits a MsgDelegate plus the MsgGrant that turns on restaking, so the
 * pair is one operation rather than a bundle. It needs both halves to be operations the chain
 * offers, since that one route is what produces it.
 *
 * Returns null when the messages are not that pair at all, leaving the caller to fall through
 * to the ordinary single-message path.
 */
const matchStakeWithRestake = (
  messages: CosmosMessage[],
  supported: ReadonlySet<CosmosOperation>,
): TransactionVerdict | null => {
  const [first, second] = messages;
  if (messages.length !== 2 || first.kind !== 'delegate' || second.kind !== 'authzGrant') return null;
  if (!supported.has('stake') || !supported.has('restake-rewards')) return null;

  const grant = matchRestakeGrant(second);
  return isRejection(grant) ? unrecognized(grant.rejection) : recognized('stake-with-restake-rewards');
};

export const classifyCosmosTransaction = (
  chain: CosmosChainName,
  transaction: CosmosTransaction,
): TransactionVerdict => {
  const supported = KILN_OPERATIONS_BY_CHAIN[chain];
  const { messages } = transaction;

  if (messages.length === 0) {
    return unrecognized('This transaction contains no messages.');
  }

  if (supported.size === 0) {
    return unrecognized('Kiln does not craft transactions on this chain, so no transaction on it can be a Kiln one.');
  }

  const stakeWithRestake = matchStakeWithRestake(messages, supported);
  if (stakeWithRestake) {
    return stakeWithRestake;
  }

  if (messages.length > 1) {
    return unrecognized(
      `This transaction bundles ${messages.length} messages. Kiln operations carry one, except a stake that also turns on restaking.`,
    );
  }

  const match = matchMessage(messages[0]);
  if (isRejection(match)) {
    return unrecognized(match.rejection);
  }

  if (!supported.has(match.operation)) {
    return unrecognized(`Kiln does not craft a ${match.operation} operation on this chain.`);
  }

  return recognized(match.operation);
};
