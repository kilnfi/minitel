import { prettyPrintJson } from 'pretty-print-json';
import { Transaction } from '@emurgo/cardano-serialization-lib-nodejs';

export const parseAdaTx = async (txRaw: string): Promise<string> => {
	const tx = Transaction.from_hex(txRaw);

	return prettyPrintJson.toHtml(tx.to_js_value(), { quoteKeys: true });
};
