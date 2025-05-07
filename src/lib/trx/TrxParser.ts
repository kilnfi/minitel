import tronweb from "tronweb";
import { TrxProtobuf } from "./protos";

const TronWeb = tronweb.TronWeb;
const addressUtils = TronWeb.address;

export class TrxParser {
  constructor() {}

  public serializedToPb(tx_serialized: string): unknown {
    // @ts-ignore
    const txData = globalThis.proto.Transaction.raw.deserializeBinary(
      Buffer.from(tx_serialized, "hex")
    );
    const txDataObj = txData.toObject();

    const tranactionType = txDataObj.contractList[0].parameter.typeUrl.split("/").pop();
    const value = txDataObj.contractList[0].parameter.value;
    const decodedValue = this.decodeValue(tranactionType, value);

    const enhancedDecoded = {
      decodedValue,
      raw: { ...txDataObj },
    };

    return enhancedDecoded;
  }

  private formatAddress(hexBuffer: Buffer): string | null {
    if (!hexBuffer || hexBuffer.length === 0) return null;
    const hex = hexBuffer.toString("hex");
    return addressUtils.fromHex("41" + hex.slice(-40)); // prepend 0x41 for mainnet
  }

  private decodeValue(transaction_type: string, value: string): object {
    switch (transaction_type) {
      case "protocol.FreezeBalanceV2Contract":
        return this.decodeFreezeBalanceV2Contract(value);
      case "protocol.UnfreezeBalanceV2Contract":
        return this.decodeUnfreezeBalanceV2Contract(value);
      case "protocol.CancelAllUnfreezeV2Contract":
        return this.decodeCancelUnfreezeBalanceV2Contract(value);
      case "protocol.WithdrawExpireUnfreezeContract":
        return this.decodeWithdrawExpireUnfreezeContract(value);
      case "protocol.VoteContract":
      case "protocol.VoteWitnessContract":
        return this.decodeVoteContract(value);
      case "protocol.WithdrawBalanceContract":
        return this.decodeWithdrawBalanceContract(value);
      default:
        console.error("Unknown transaction type:", transaction_type);
        return { error: "Unable to decode value" };
    }
  }
  private decodeFreezeBalanceV2Contract(value: string): object {
    const buffer = Buffer.from(value, "base64");

    const FreezeBalanceV2Contract = TrxProtobuf.lookupType("protocol.FreezeBalanceV2Contract");
    const decoded = FreezeBalanceV2Contract.decode(buffer) as unknown as {
      owner_address: Buffer;
      frozen_balance: number;
      resource: number;
      receiver_address: Buffer;
    };

    return {
      owner_address: this.formatAddress(decoded.owner_address),
      frozen_balance: decoded.frozen_balance,
      resource: this.enhanceResource(decoded.resource),
      receiver_address: this.formatAddress(decoded.receiver_address),
    };
  }

  private decodeUnfreezeBalanceV2Contract(value: string): object {
    const buffer = Buffer.from(value, "base64");

    const UnFreezeBalanceV2Contract = TrxProtobuf.lookupType("protocol.UnfreezeBalanceV2Contract");
    const decoded = UnFreezeBalanceV2Contract.decode(buffer) as unknown as {
      owner_address: Buffer;
      unfreeze_balance: number;
      resource: number;
    };

    return {
      owner_address: this.formatAddress(decoded.owner_address),
      unfreeze_balance: decoded.unfreeze_balance,
      resource: this.enhanceResource(decoded.resource),
    };
  }

  private decodeCancelUnfreezeBalanceV2Contract(value: string): object {
    const buffer = Buffer.from(value, "base64");

    const CancelUnfreezeBalanceV2Contract = TrxProtobuf.lookupType(
      "protocol.CancelUnfreezeBalanceV2Contract"
    );
    const decoded = CancelUnfreezeBalanceV2Contract.decode(buffer) as unknown as {
      owner_address: Buffer;
    };

    return {
      owner_address: this.formatAddress(decoded.owner_address),
    };
  }
  private decodeWithdrawExpireUnfreezeContract(value: string): object {
    const buffer = Buffer.from(value, "base64");

    const WithdrawExpireUnfreezeContract = TrxProtobuf.lookupType(
      "protocol.WithdrawExpireUnfreezeContract"
    );
    const decoded = WithdrawExpireUnfreezeContract.decode(buffer) as unknown as {
      owner_address: Buffer;
    };
    return {
      owner_address: this.formatAddress(decoded.owner_address),
    };
  }

  private decodeVoteContract(value: string): object {
    const buffer = Buffer.from(value, "base64");

    const VoteContract = TrxProtobuf.lookupType("protocol.VoteContract");
    const decoded = VoteContract.decode(buffer) as unknown as {
      owner_address: Buffer;
      votes: Array<{ vote_address: Buffer; vote_count: Long }>;
    };

    return {
      owner_address: this.formatAddress(decoded.owner_address),
      votes: decoded.votes.map((vote) => ({
        vote_address: this.formatAddress(vote.vote_address),
        vote_count: vote.vote_count.toNumber(),
      })),
    };
  }

  private decodeWithdrawBalanceContract(value: string): object {
    const buffer = Buffer.from(value, "base64");

    const WithdrawBalanceContract = TrxProtobuf.lookupType("protocol.WithdrawBalanceContract");
    const decoded = WithdrawBalanceContract.decode(buffer) as unknown as {
      owner_address: Buffer;
    };

    return {
      owner_address: this.formatAddress(decoded.owner_address),
    };
  }

  private enhanceResource(
    resource: number
  ): string {
    switch (resource) {
      case 0:
        return "BANDWIDTH";
      case 1:
        return "ENERGY";
      case 2:
        return "ALL";
      default:
        return "UNKNOWN";
    }
  }
}
