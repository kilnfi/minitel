import { recognized, type TransactionVerdict, unrecognized, unverified } from '@protocols/shared';

/**
 * Kiln's Gram routes each send one internal message, identified by the opcode at the head of
 * its body — or, for a whales deposit, a "Deposit" text comment. Any of them may be routed
 * through a vesting contract, which wraps the real message in a vesting send.
 *
 * Staking into a single-nominator pool is the exception: it is a bare transfer to the pool,
 * indistinguishable from sending funds anywhere else, so it can only be unverified.
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

/** Internal messages keyed by index, or just a wallet body if there are none. */
type ParsedTonTransaction = Record<string, { message?: ParsedMessage } | unknown>;

const OPERATION_BY_OPCODE_NAME: Record<string, string> = {
  vesting_contract_single_nominator_pool_withdraw: 'unstake-single-nomination-pool',
  whales_nominator_contract_stake_withdraw: 'unstake-pool',
  vesting_contract_add_whitelist: 'whitelist-vesting-contract',
};

/** A whales-pool deposit carries this comment in place of an opcode. */
const WHALES_DEPOSIT_COMMENT = 'Deposit';

const isMessageEntry = (entry: unknown): entry is { message: ParsedMessage } =>
  typeof entry === 'object' && entry !== null && 'message' in entry;

/** A vesting contract forwards on the owner's behalf, so the real operation is inside. */
const unwrapVestingSend = (body: ParsedBody | undefined): ParsedBody | undefined =>
  body?.op_code_name === 'vesting_contract_send' ? body.params?.out_msg?.body : body;

export const classifyTonTransaction = (transaction: ParsedTonTransaction): TransactionVerdict => {
  const messages = Object.values(transaction ?? {}).filter(isMessageEntry);

  if (messages.length === 0) {
    return unrecognized('This transaction sends no message, so there is no operation to check.');
  }

  // A wallet can carry up to four, but Kiln sends one.
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

  // No opcode and no comment: a bare transfer, which is both a pool deposit and a drain.
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
