export const solExplorerLink = (hash: string, type: 'tx' | 'address') => {
  return `https://solscan.io/${type}/${hash}`;
};
