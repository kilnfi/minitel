import tronweb from 'tronweb';

interface TxPb {
  setRawData(raw: object): void;
  toObject(): object;
}

export class TrxParser {
  constructor() {
    // @ts-ignore to keep importing tronweb
    tronweb
  }
  public serializedToPb(tx_serialized: string): TxPb {
    // @ts-ignore
    const txData = globalThis.proto.Transaction.raw.deserializeBinary(Buffer.from(tx_serialized, 'hex'));
    // @ts-ignore
    const tx = new globalThis.proto.Transaction() as TxPb;
    tx.setRawData(txData);
    return tx;
  }
}
