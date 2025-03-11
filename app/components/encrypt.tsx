'use client';

import SimpleCrypto from 'simple-crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET || "default"
const simpleCrypto = new SimpleCrypto(SECRET_KEY);

export const encryptText = (plainText: string): string => {
  return simpleCrypto.encrypt(plainText);
};

export const decryptText = (encryptedText: string): string => {
  return simpleCrypto.decrypt(encryptedText).toString();
};