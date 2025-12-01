import Pbf from 'pbf';

function readFreezeBalanceV2Contract(pbf: Pbf, end?: number) {
  const obj: Record<string, unknown> = {};
  pbf.readFields((tag) => {
    if (tag === 1) obj.owner_address = pbf.readBytes();
    else if (tag === 2) obj.frozen_balance = pbf.readVarint();
    else if (tag === 3) obj.resource = pbf.readVarint();
    else if (tag === 4) obj.receiver_address = pbf.readBytes();
  }, end);
  return obj;
}

function readUnfreezeBalanceV2Contract(pbf: Pbf, end?: number) {
  const obj: Record<string, unknown> = {};
  pbf.readFields((tag) => {
    if (tag === 1) obj.owner_address = pbf.readBytes();
    else if (tag === 2) obj.unfreeze_balance = pbf.readVarint();
    else if (tag === 3) obj.resource = pbf.readVarint();
  }, end);
  return obj;
}

function readCancelUnfreezeBalanceV2Contract(pbf: Pbf, end?: number) {
  const obj: Record<string, unknown> = {};
  pbf.readFields((tag) => {
    if (tag === 1) obj.owner_address = pbf.readBytes();
  }, end);
  return obj;
}

function readWithdrawExpireUnfreezeContract(pbf: Pbf, end?: number) {
  const obj: Record<string, unknown> = {};
  pbf.readFields((tag) => {
    if (tag === 1) obj.owner_address = pbf.readBytes();
  }, end);
  return obj;
}

function readVote(pbf: Pbf, end?: number) {
  const obj: Record<string, unknown> = {};
  pbf.readFields((tag) => {
    if (tag === 1) obj.vote_address = pbf.readBytes();
    else if (tag === 2) obj.vote_count = pbf.readVarint();
  }, end);
  return obj;
}

function readVoteWitnessContract(pbf: Pbf, end?: number) {
  const obj: Record<string, unknown> = { votes: [] };
  pbf.readFields((tag) => {
    if (tag === 1) obj.owner_address = pbf.readBytes();
    else if (tag === 2) {
      const votes = obj.votes as Array<Record<string, unknown>>;
      votes.push(readVote(pbf, pbf.readVarint() + pbf.pos));
    }
  }, end);
  return obj;
}

function readWithdrawBalanceContract(pbf: Pbf, end?: number) {
  const obj: Record<string, unknown> = {};
  pbf.readFields((tag) => {
    if (tag === 1) obj.owner_address = pbf.readBytes();
  }, end);
  return obj;
}

export const TrxProtobuf = {
  lookupType(typeName: string) {
    const decoders: Record<string, (pbf: Pbf, end?: number) => Record<string, unknown>> = {
      'protocol.FreezeBalanceV2Contract': readFreezeBalanceV2Contract,
      'protocol.UnfreezeBalanceV2Contract': readUnfreezeBalanceV2Contract,
      'protocol.CancelUnfreezeBalanceV2Contract': readCancelUnfreezeBalanceV2Contract,
      'protocol.WithdrawExpireUnfreezeContract': readWithdrawExpireUnfreezeContract,
      'protocol.VoteWitnessContract': readVoteWitnessContract,
      'protocol.WithdrawBalanceContract': readWithdrawBalanceContract,
    };

    const decoder = decoders[typeName];
    if (!decoder) throw new Error(`Unknown type: ${typeName}`);

    return {
      decode(buffer: Buffer) {
        const pbf = new Pbf(buffer);
        return decoder(pbf);
      },
    };
  },
};
