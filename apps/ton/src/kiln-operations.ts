import { recognized, type TransactionVerdict, unrecognized, unverified } from '@protocols/shared';

/**
 * The Gram (ex TON) operations Kiln crafts, and the message each one sends.
 *
 * Source of truth is Kiln's transaction-crafting API, which the public Kiln Connect spec
 * exposes as `/gram/transaction/{stake-single-nomination-pool,unstake-single-nomination-pool,
 * stake-pool,unstake-pool,whitelist-vesting-contract}`.
 *
 * Every one sends a single internal message, identified by the opcode at the head of its body:
 *
 * - unstake from a single-nominator pool — the pool's withdraw opcode
 * - unstake from a whales pool — the nominator contract's stake_withdraw opcode
 * - stake into a whales pool — a text comment reading "Deposit"
 * - whitelist a vesting contract — the vesting contract's add_whitelist opcode
 *
 * Each of these can also be sent *through* a vesting contract, which wraps the real message in
 * a vesting `send`. The wrapper is unwrapped and the message inside is classified on its own
 * terms, so a vesting-routed unstake reads the same as a direct one.
 *
 * Staking into a single-nominator pool is the exception, and the reason this file returns
 * `unverified` for one case: on this chain that deposit is nothing but a transfer of TON to the
 * pool address, with no opcode and no comment to match on. It is indistinguishable from sending
 * TON to any other address, and the only thing separating the two is whether the destination is
 * a Kiln pool — which lives in Kiln's configuration and is not knowable here.
 */

type ParsedBody = {
  op_code_name?: string;
  op_code?: number;
  params?: { out_msg?: { body?: ParsedBody } };
};

type ParsedMessage = {
  header?: { dest?: { bouncable?: string } | null; grams?: string };
  body?: ParsedBody;
};

/** The parser returns internal messages keyed by index, or just a wallet body if there are none. */
type ParsedTonTransaction = Record<string, { message?: ParsedMessage } | unknown>;

const OPERATION_BY_OPCODE_NAME: Record<string, string> = {
  vesting_contract_single_nominator_pool_withdraw: 'unstake-single-nomination-pool',
  whales_nominator_contract_stake_withdraw: 'unstake-pool',
  vesting_contract_add_whitelist: 'whitelist-vesting-contract',
};

/** The text comment a whales-pool deposit carries in place of an opcode. */
const WHALES_DEPOSIT_COMMENT = 'Deposit';

const isMessageEntry = (entry: unknown): entry is { message: ParsedMessage } =>
  typeof entry === 'object' && entry !== null && 'message' in entry;

/**
 * A vesting contract forwards on the owner's behalf, so the operation being authorised is the
 * one inside the wrapper rather than the wrapper itself.
 */
const unwrapVestingSend = (body: ParsedBody | undefined): ParsedBody | undefined =>
  body?.op_code_name === 'vesting_contract_send' ? body.params?.out_msg?.body : body;

export const classifyTonTransaction = (transaction: ParsedTonTransaction): TransactionVerdict => {
  const messages = Object.values(transaction ?? {}).filter(isMessageEntry);

  if (messages.length === 0) {
    return unrecognized('This transaction sends no message, so there is no operation to check.');
  }

  // Kiln sends one message per transaction. A wallet can carry up to four, and the summary
  // renders them all, but a second message is not something we crafted.
  if (messages.length > 1) {
    return unrecognized(`This transaction sends ${messages.length} messages. Kiln operations on this chain send one.`);
  }

  const body = unwrapVestingSend(messages[0].message?.body);
  const opCodeName = body?.op_code_name;

  if (opCodeName && OPERATION_BY_OPCODE_NAME[opCodeName]) {
    return recognized(OPERATION_BY_OPCODE_NAME[opCodeName]);
  }

  if (opCodeName === WHALES_DEPOSIT_COMMENT) {
    return recognized('stake-pool');
  }

  // No opcode and no comment: a bare transfer. That is exactly what a single-nominator pool
  // deposit looks like, and exactly what sending TON to an attacker looks like too.
  if (!opCodeName || opCodeName === 'unknown') {
    if (body?.op_code !== undefined) {
      return unrecognized(
        `This transaction sends a message with opcode ${body.op_code}, which is not one Kiln operations use.`,
      );
    }

    const destination = messages[0].message?.header?.dest?.bouncable;
    return unverified(
      `This is the shape of a deposit into a single-nominator pool — a plain transfer carrying no instruction — but that is also the shape of sending your funds anywhere else. Check that ${destination ?? 'the destination below'} is the Kiln pool you meant to stake with.`,
    );
  }

  return unrecognized(`This transaction sends a "${opCodeName}" message, which is not one Kiln operations use.`);
};
