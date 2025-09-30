import { formatUnits, parseUnits } from '@protocols/shared';

export const yoctoToNear = (yocto: bigint): string => {
  return formatUnits(yocto, 24);
};

export const nearToYocto = (near: string): bigint => {
  return parseUnits(near, 24);
};
