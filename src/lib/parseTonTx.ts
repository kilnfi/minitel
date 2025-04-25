import TonWeb from "tonweb";
import { TonParser } from "./ton/TonParser";

export const parseTonTx = (txRaw: string): object => {
  const boc = TonWeb.boc.Cell.fromBoc(txRaw);
      const cells = [];
      for (let i = 0; i < boc.length; i++) {
        cells.push({
          body: new TonParser(boc[i]).parseTx(),
          message: new TonParser(boc[i].refs[0]).parseCommonMsgInfo(),
        });
      }
      return { ...cells };
};
