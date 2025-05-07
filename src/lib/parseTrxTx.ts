import { TrxParser } from './trx/TrxParser';

const trxParser = new TrxParser();

export const parseTrxTx = (tx_serialized: string) => {
  try {
    const pbTx = trxParser.serializedToPb(tx_serialized);
    return pbTx
  } catch (err) {
    console.error(err);
    throw new Error('Failed to parse Trx transaction');
  }
}
