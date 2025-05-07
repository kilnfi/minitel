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
      raw: {...txDataObj },
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
        case "protocol.UnFreezeBalanceV2Contract":
          return this.decodeUnFreezeBalanceV2Contract(value);
        case "protocol.CancelUnFreezeBalanceV2Contract":
          return this.decodeCancelUnFreezeBalanceV2Contract(value);
        case "protocol.WithdrawExpiredUnfreezeContract":
          return this.decodeWithdrawExpiredUnfreezeContract(value);
        case "protocol.VoteContract":
          return this.decodeVoteContract(value);
        case "protocol.WithdrawBlockRewardContract":
          return this.decodeWithdrawBlockRewardContract(value);
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
      resource: decoded.resource,
      receiver_address: this.formatAddress(decoded.receiver_address),
    };
  }

  private decodeUnFreezeBalanceV2Contract(value: string): object {
    const buffer = Buffer.from(value, "base64");

    const UnFreezeBalanceV2Contract = TrxProtobuf.lookupType("protocol.UnFreezeBalanceV2Contract");
    const decoded = UnFreezeBalanceV2Contract.decode(buffer) as unknown as {
      owner_address: Buffer;
      unfreeze_balance: number;
      resource: number;
    };

    return {
      owner_address: this.formatAddress(decoded.owner_address),
      unfreeze_balance: decoded.unfreeze_balance,
      resource: decoded.resource,
    };
  }

  private decodeCancelUnFreezeBalanceV2Contract(value: string): object {
    const buffer = Buffer.from(value, "base64");

    const CancelUnFreezeBalanceV2Contract = TrxProtobuf.lookupType("protocol.CancelUnFreezeBalanceV2Contract");
    const decoded = CancelUnFreezeBalanceV2Contract.decode(buffer) as unknown as {
      owner_address: Buffer;
    };

    return {
      owner_address: this.formatAddress(decoded.owner_address),
    };
  }
  private decodeWithdrawExpiredUnfreezeContract(value: string): object {
    const buffer = Buffer.from(value, "base64");

    const WithdrawExpiredUnfreezeContract = TrxProtobuf.lookupType("protocol.WithdrawExpiredUnfreezeContract");
    const decoded = WithdrawExpiredUnfreezeContract.decode(buffer) as unknown as {
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
      votes: Array<{ vote_address: Buffer; vote_count: number }>;
    };

    return {
      owner_address: this.formatAddress(decoded.owner_address),
      votes: decoded.votes.map((vote) => ({
        vote_address: this.formatAddress(vote.vote_address),
        vote_count: vote.vote_count,
      })),
    };
  }

  private decodeWithdrawBlockRewardContract(value: string): object {
    const buffer = Buffer.from(value, "base64");

    const WithdrawBlockRewardContract = TrxProtobuf.lookupType("protocol.WithdrawBlockRewardContract");
    const decoded = WithdrawBlockRewardContract.decode(buffer) as unknown as {
      owner_address: Buffer;
    };

    return {
      owner_address: this.formatAddress(decoded.owner_address),
    };
  }
}
