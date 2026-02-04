export const solExplorerLink = (hash: string, type: 'tx' | 'address') => {
  return `https://solscan.io/${type}/${hash}`;
};

export const isHex = (s: string): boolean => {
  return /^[0-9a-fA-F]+$/.test(s) && s.length % 2 === 0;
};

export const isBase64 = (s: string): boolean => {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(s) && s.length % 4 === 0;
};

export const base64ToHex = (base64: string): string => {
  const binary = atob(base64);
  let hex = '';
  for (let i = 0; i < binary.length; i++) {
    const byte = binary.charCodeAt(i).toString(16).padStart(2, '0');
    hex += byte;
  }
  return hex;
};
