import { NEAR, type ProtocolAdapter } from '@protocols/shared';
import { TransactionSummary } from '@/components/TransactionSummary';
import { type NearTransaction, parseNearTx } from '@/parser';

const computeNearHash = async (rawTx: string): Promise<string> => {
  try {
    const input = rawTx.trim();

    const transactionUint8Array = new Uint8Array(input.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const hashBuffer = await crypto.subtle.digest('SHA-256', transactionUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    throw new Error('Failed to compute Near hash');
  }
};

export const nearAdapter: ProtocolAdapter<NearTransaction> = {
  protocol: NEAR,
  name: 'near',
  displayName: 'Near',
  placeholder: 'Paste your transaction as hex',

  parseTransaction: async (rawTx) => parseNearTx(rawTx),
  computeHash: computeNearHash,

  renderSummary: (data) => <TransactionSummary transaction={data} />,

  generateWarnings: (data) => {
    const warnings: { message: string }[] = [];

    for (const action of data.actions) {
      if (action.type === 'transfer') {
        warnings.push({
          message: `⚠️ Unexpected Transfer detected: ${(Number(action.amount) / 1e24).toFixed(6)} NEAR`,
        });
      }

      if (action.type === 'functionCall' && action.stakingOperation === null) {
        warnings.push({
          message: `⚠️ Unexpected function call: ${action.methodName}()`,
        });
      }

      if (action.type === 'createAccount') {
        warnings.push({
          message: `⚠️ Account creation detected`,
        });
      }

      if (action.type === 'deleteAccount') {
        warnings.push({
          message: `🚨 CRITICAL: Account deletion detected! Beneficiary: ${action.beneficiaryId}`,
        });
      }

      if (action.type === 'addKey' || action.type === 'deleteKey') {
        warnings.push({
          message: `⚠️ Key management operation detected`,
        });
      }

      if (action.type === 'deployContract') {
        warnings.push({
          message: `🚨 CRITICAL: Contract deployment detected!`,
        });
      }

      if (action.type === 'stake') {
        warnings.push({
          message: `⚠️ Native stake action detected (unusual for staking dashboard)`,
        });
      }

      if (action.type === 'unsupported') {
        warnings.push({
          message: `🚨 CRITICAL: Unsupported action type detected!`,
        });
      }
    }

    return warnings;
  },
};
