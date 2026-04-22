import { TransactionDataBuilder } from '@mysten/sui/transactions';
import { fromBase64 } from '@mysten/sui/utils';
import crypto from 'crypto';

const b64 = 'AAADAAgAypo7AAAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUBAAAAAAAAAAEAIJLHv5kUiX6IeOVZwZps/9IualaabdTSb46C4PKtGHPWAgIAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwpzdWlfc3lzdGVtEXJlcXVlc3RfYWRkX3N0YWtlAAMBAQADAAAAAAECAFHaiwnB8n8kanQcu8wioU72F1RLfJvHYjAAmprfANd1AQbAfVFBlKl0OkwmjNccCo/aX5lgXnflRF5ZwUR86b5fFN2kMQAAAAAgfF0gfMZnQZG6PyZMTpPsE+wDHVbU/9egVN/a/+kKL1VR2osJwfJ/JGp0HLvMIqFO9hdUS3ybx2IwAJqa3wDXdSwCAAAAAAAA6Oq/AAAAAAAA';
const bytes = fromBase64(b64);

// 1) base58
const digest = TransactionDataBuilder.getDigestFromBytes(bytes);
console.log('base58 digest (on-chain tx id):', digest);

function blake2b256(data) {
  return crypto.createHash('blake2b256').update(data).digest('hex');
}

// 2) Intent prefix: blake2b256([0,0,0] || bytes)
const intentBytes = new Uint8Array(3 + bytes.length);
intentBytes.set([0, 0, 0]);
intentBytes.set(bytes, 3);
console.log('blake2b([0,0,0]||bytes) hex:    ', blake2b256(intentBytes));

// 3) Intent prefix: blake2b256([0,0,0] || bytes) with scope=3 (PersonalMessage)
const intentBytes2 = new Uint8Array(3 + bytes.length);
intentBytes2.set([3, 0, 0]);
intentBytes2.set(bytes, 3);
console.log('blake2b([3,0,0]||bytes) hex:    ', blake2b256(intentBytes2));

// 4) TransactionData:: tag
const typeTag = Array.from('TransactionData::').map(c => c.charCodeAt(0));
const taggedBytes = new Uint8Array(typeTag.length + bytes.length);
taggedBytes.set(typeTag);
taggedBytes.set(bytes, typeTag.length);
console.log('blake2b(TransactionData::||bytes):', blake2b256(taggedBytes));
