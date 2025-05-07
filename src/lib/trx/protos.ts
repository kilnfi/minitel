import protobuf from "protobufjs";

const FreezeBalanceV2Contract = {
  fields: {
    owner_address: { type: "bytes", id: 1 },
    frozen_balance: { type: "int64", id: 2 },
    resource: { type: "int32", id: 3 },
    receiver_address: { type: "bytes", id: 4 },
  },
};

const UnFreezeBalanceV2Contract = {
  fields: {
    owner_address: { type: "bytes", id: 1 },
    unfreeze_balance: { type: "int64", id: 2 },
    resource: { type: "int32", id: 3 },
  },
};

const CancelUnFreezeBalanceV2Contract = {
  fields: {
    owner_address: { type: "bytes", id: 1 },
  },
};

const WithdrawExpiredUnfreezeContract = {
  fields: {
    owner_address: { type: "bytes", id: 1 },
  },
};

const Vote = {
  fields: {
    vote_address: { type: "bytes", id: 1 },
    vote_count: { type: "int64", id: 2 },
  },
};

const VoteContract = {
  fields: {
    owner_address: { type: "bytes", id: 1 },
    votes: { rule: "repeated", type: "Vote", id: 2 },
  },
};

const WithdrawBlockRewardContract = {
    fields: {
        owner_address: { type: "bytes", id: 1 },
    },
};

export const TrxProtobuf = protobuf.Root.fromJSON({
  nested: {
    protocol: {
      nested: {
        FreezeBalanceV2Contract,
        UnFreezeBalanceV2Contract,
        CancelUnFreezeBalanceV2Contract,
        WithdrawExpiredUnfreezeContract,
        Vote,
        VoteContract,
        WithdrawBlockRewardContract,
      },
    },
  },
});
