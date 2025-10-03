import protobuf from 'protobufjs';

const FreezeBalanceV2Contract = {
  fields: {
    owner_address: { type: 'bytes', id: 1 },
    frozen_balance: { type: 'int64', id: 2 },
    resource: { type: 'int32', id: 3 },
    receiver_address: { type: 'bytes', id: 4 },
  },
};

const UnfreezeBalanceV2Contract = {
  fields: {
    owner_address: { type: 'bytes', id: 1 },
    unfreeze_balance: { type: 'int64', id: 2 },
    resource: { type: 'int32', id: 3 },
  },
};

const CancelUnfreezeBalanceV2Contract = {
  fields: {
    owner_address: { type: 'bytes', id: 1 },
  },
};

const WithdrawExpireUnfreezeContract = {
  fields: {
    owner_address: { type: 'bytes', id: 1 },
  },
};

const Vote = {
  fields: {
    vote_address: { type: 'bytes', id: 1 },
    vote_count: { type: 'int64', id: 2 },
  },
};

const VoteWitnessContract = {
  fields: {
    owner_address: { type: 'bytes', id: 1 },
    votes: { rule: 'repeated', type: 'Vote', id: 2 },
  },
};

const WithdrawBalanceContract = {
  fields: {
    owner_address: { type: 'bytes', id: 1 },
  },
};

export const TrxProtobuf = protobuf.Root.fromJSON({
  nested: {
    protocol: {
      nested: {
        FreezeBalanceV2Contract,
        UnfreezeBalanceV2Contract,
        CancelUnfreezeBalanceV2Contract,
        WithdrawExpireUnfreezeContract,
        Vote,
        VoteWitnessContract,
        WithdrawBalanceContract,
      },
    },
  },
});
