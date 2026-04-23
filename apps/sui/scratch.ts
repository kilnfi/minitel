import crypto from 'crypto';
console.log(crypto.getHashes().filter(h => h.includes('blake2b')));
