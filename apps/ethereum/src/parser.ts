import { PublicKey, StakeProgram, SystemProgram } from '@solana/web3.js';

export const SYSTEM_PROGRAM_ID = new PublicKey(SystemProgram.programId);
export const STAKE_PROGRAM_ID = new PublicKey(StakeProgram.programId);

export const parseEthTx = (_tx: string) => {
  return {
    signatures: [],
    feePayer: '',
    systemProgramId: SYSTEM_PROGRAM_ID.toString(),
    stakeProgramId: STAKE_PROGRAM_ID.toString(),
    recentBlockhash: '',
    instructions: [],
  };
};
