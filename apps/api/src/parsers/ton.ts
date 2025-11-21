import TonWeb from 'tonweb';
import type { Cell } from 'tonweb/dist/types/boc/cell';
import type { Address } from 'tonweb/dist/types/utils/address';
import { VESTING_CONTRACT_OPCODES, WHALES_NOMINATOR_CONTRACT_OPCODES } from './ton-constants';

type ParsedAddress = {
  hex: string;
  bouncable: string;
  nonBouncable: string;
};

type ParsedContractMessage = {
  op_code_name: string;
  op_code?: number;
  params?: Record<string, unknown>;
};

type ParsedCommonMsgInfo = {
  header: ParsedHeader;
  stateInit: null;
  body: ParsedContractMessage | null;
};

type ParsedHeader = {
  ihrDisabled: boolean;
  bounce: boolean;
  bounced: boolean;
  src: ParsedAddress | null;
  dest: ParsedAddress | null;
  grams: string;
  currencyCollection: boolean;
  ihrFees: string;
  fwdFees: string;
  createdLt: string;
  createdAt: string;
};

export class TonParser {
  public cursor: number;
  public cell: Cell;

  constructor(cell: Cell) {
    this.cursor = 0;
    this.cell = cell;
  }

  protected readBinary(idx: number): string {
    return this.cell.bits.get(idx) ? '1' : '0';
  }

  parseBoolean(): boolean {
    return this.cell.bits.get(this.cursor++);
  }

  parseGrams(): bigint {
    let first4bytes = '';

    for (let i = 0; i < 4; i++) {
      first4bytes += this.readBinary(this.cursor);
      this.cursor++;
    }

    if (first4bytes === '0000') {
      return 0n;
    }

    const l = Number(`0b${first4bytes}`);
    let numStr = '';

    for (let i = 0; i < l * 8; i++) {
      numStr += this.readBinary(this.cursor);
      this.cursor++;
    }

    return BigInt(`0b${numStr}`);
  }

  parseUint(bits: number): bigint {
    let n = BigInt(0);

    for (let i = 0; i < bits; i++) {
      n *= BigInt(2);
      n += BigInt(this.cell.bits.get(this.cursor));
      this.cursor++;
    }

    return n;
  }

  parseAddress(): Address | null {
    let first2bytes = '';

    for (let i = 0; i < 2; i++) {
      first2bytes += this.readBinary(this.cursor);
      this.cursor++;
    }

    if (first2bytes === '00') {
      return null;
    }

    if (first2bytes === '10') {
      this.cursor++;

      let n = this.parseUint(8);
      if (n > BigInt(127)) {
        n = n - BigInt(256);
      }

      const hashPart = this.parseUint(256);
      if (`${n.toString(10)}:${hashPart.toString(16)}` === '0:0') return null;
      const s = `${n.toString(10)}:${hashPart.toString(16).padStart(64, '0')}`;
      return new TonWeb.Address(s);
    }

    throw new Error('Invalid address type');
  }

  parseStateInit() {
    if (this.parseBoolean()) {
      if (!this.parseBoolean()) {
        throw new Error('Not supported: stateInit is in bits');
      }
    }

    return null;
  }

  parseBody() {
    if (!this.parseBoolean()) {
      if (this.cursor < this.cell.bits.length) {
        return this.parseCell();
      }
      return null;
    }

    return new TonParser(this.cell.refs[0]).parseCell();
  }

  parseContractOutMsg() {
    return this.parseCommonMsgInfo();
  }

  parseCell(): ParsedContractMessage {
    const op_code = Number(this.parseUint(32));

    switch (op_code) {
      case VESTING_CONTRACT_OPCODES.send: {
        const query_id = this.parseUint(64);
        const send_mode = this.parseUint(8);
        const out_msg = new TonParser(this.cell.refs[0]).parseContractOutMsg();

        return {
          op_code_name: 'vesting_contract_send',
          op_code,
          params: {
            query_id: query_id.toString(),
            send_mode: send_mode.toString(),
            out_msg,
          },
        };
      }

      case VESTING_CONTRACT_OPCODES.single_nominator_pool_withdraw: {
        const query_id = this.parseUint(64);
        const coins = this.parseGrams();

        return {
          op_code_name: 'vesting_contract_single_nominator_pool_withdraw',
          op_code,
          params: {
            query_id: query_id.toString(),
            coins: coins.toString(),
          },
        };
      }

      case VESTING_CONTRACT_OPCODES.add_whitelist: {
        const query_id = this.parseUint(64);
        const addresses = [];
        let address: Address | null;

        while (this.cursor < this.cell.bits.length) {
          address = this.parseAddress();

          address &&
            addresses.push({
              hex: address.toString(),
              bouncable: address.toString(true, true, true, false),
              nonBouncable: address.toString(true, true, false, false),
            });
        }

        return {
          op_code_name: 'vesting_contract_add_whitelist',
          op_code,
          params: {
            query_id: query_id.toString(),
            addresses,
          },
        };
      }

      case WHALES_NOMINATOR_CONTRACT_OPCODES.stake_withdraw: {
        const query_id = this.parseUint(64);
        const gas = this.parseGrams();
        const amount = this.parseGrams();

        return {
          op_code_name: 'whales_nominator_contract_stake_withdraw',
          op_code,
          params: {
            query_id: query_id.toString(),
            gas: gas.toString(),
            amount: amount.toString(),
          },
        };
      }

      case 0: {
        const bytes = [];
        let i = 0;

        while (this.cursor < this.cell.bits.length) {
          bytes[i] = Number(this.parseUint(8));
          i++;
        }
        const op_code_name = new TextDecoder().decode(new Uint8Array(bytes));

        return {
          op_code_name: op_code_name || 'unknown',
        };
      }

      default: {
        return {
          op_code_name: 'unknown',
          op_code,
        };
      }
    }
  }

  parseCommonMsgInfo(): ParsedCommonMsgInfo {
    const header = this.parseInternalMessageHeader();
    const stateInit = this.parseStateInit();
    const body = this.parseBody();

    return {
      header,
      stateInit,
      body,
    };
  }

  parseInternalMessageHeader(): ParsedHeader {
    this.parseBoolean();
    const ihrDisabled = this.parseBoolean();
    const bounce = this.parseBoolean();
    const bounced = this.parseBoolean();
    const src = this.parseAddress();
    const dest = this.parseAddress();
    const grams = this.parseGrams();
    const currencyCollection = this.parseBoolean();
    const ihrFees = this.parseGrams();
    const fwdFees = this.parseGrams();
    const createdLt = this.parseUint(64);
    const createdAt = this.parseUint(32);

    return {
      ihrDisabled,
      bounce,
      bounced,
      src: src
        ? {
            hex: src.toString(),
            bouncable: src.toString(true, true, true),
            nonBouncable: src.toString(true, true, false),
          }
        : null,
      dest: dest
        ? {
            hex: dest.toString(),
            bouncable: dest.toString(true, true, true),
            nonBouncable: dest.toString(true, true, false),
          }
        : null,
      grams: grams.toString(),
      currencyCollection,
      ihrFees: ihrFees.toString(),
      fwdFees: fwdFees.toString(),
      createdLt: createdLt.toString(),
      createdAt: createdAt.toString(),
    };
  }

  parseTx() {
    const wallet_id = this.parseUint(32);
    const expiration_timestamp = this.parseUint(32);
    const seqno = this.parseUint(32);
    const op = this.parseUint(8);
    const store_mode = this.parseUint(8);

    return {
      wallet_id: wallet_id.toString(),
      expiration_timestamp: expiration_timestamp.toString(),
      seqno: seqno.toString(),
      op: op.toString(),
      store_mode: store_mode.toString(),
    };
  }
}

// Main parsing function
export const parseTonTx = async (rawTxData: string): Promise<any> => {
  try {
    // Handle both base64 and hex formats
    let bocBytes: Uint8Array;

    if (rawTxData.match(/^[0-9a-fA-F]+$/)) {
      // Hex format
      const cleanHex = rawTxData.startsWith('0x') ? rawTxData.slice(2) : rawTxData;
      bocBytes = new Uint8Array(cleanHex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) || []);
    } else {
      // Base64 format (default for TON BOC)
      // FIXED: Replace browser atob() with Node.js Buffer
      bocBytes = Buffer.from(rawTxData, 'base64');
    }

    // Parse BOC to Cell using TonWeb
    const cells = TonWeb.boc.Cell.fromBoc(bocBytes);
    const rootCell = cells[0];

    // Parse external message wrapper
    const parser = new TonParser(rootCell);

    // Skip external message header (10 for ext_in_msg_info)
    parser.parseUint(2);

    // Skip src address (00 for addr_none)
    parser.parseUint(2);

    // Skip dest address
    const destAddrType = parser.parseUint(2);
    if (destAddrType === BigInt(2)) {
      parser.parseUint(8); // workchain
      parser.parseUint(256); // hash
    }

    // Skip import fee
    parser.parseGrams();

    // Skip stateInit
    parser.parseStateInit();

    // Parse body (should be in reference)
    const bodyInRef = parser.parseBoolean();
    let bodyCell: Cell;

    if (bodyInRef) {
      bodyCell = rootCell.refs[0];
    } else {
      bodyCell = rootCell;
    }

    // Parse wallet body
    const bodyParser = new TonParser(bodyCell);
    const walletBody = bodyParser.parseTx();

    // Parse internal messages
    const result: Record<number, any> = {};
    let index = 0;

    for (const msgCell of bodyCell.refs) {
      const msgParser = new TonParser(msgCell);
      const message = msgParser.parseCommonMsgInfo();

      result[index] = {
        body: walletBody,
        message,
      };
      index++;
    }

    return Object.keys(result).length > 0 ? result : { body: walletBody };
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to parse TON transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
