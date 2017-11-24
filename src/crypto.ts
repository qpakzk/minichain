import { randomBytes } from "crypto";

import { setLengthLeft, toBuffer } from "./buffer";

const createKeccakHash = require("keccak");
const secp256k1 = require("secp256k1");
const createHash = require("create-hash");

/**
 * Generates a private key.
 */
export function generatePrivKey(): Buffer {
    let privKey;
    do {
        privKey = randomBytes(32);
    } while (!isValidPrivKey(privKey));
    return privKey;
}

/**
 * Gets the public key in a compressed format.
 */
export function getPubKey(privateKey: Buffer): Buffer {
    return secp256k1.publicKeyCreate(privateKey);
}

/**
 * Checks if the public key satisfies the rules of the curve secp256k1.
 */
export function isValidPubKey(publicKey: Buffer): boolean {
    return secp256k1.publicKeyVerify(publicKey);
}

/**
 * Checks if the private key satisfies the rules of the curve secp256k1.
 */
export function isValidPrivKey(privateKey: Buffer): boolean {
    return secp256k1.privateKeyVerify(privateKey);
}

export interface SignatureObject {
    signature: Buffer;
    recovery?: number;
}

/**
 * Signs the message.
 */
export function sign(msg: Buffer, privKey: Buffer): SignatureObject {
    return secp256k1.sign(msg, privKey);
}

/**
 * Verifies the signature.
 */
export function verify(msg: Buffer, sigObj: SignatureObject, pubKey: Buffer): boolean {
    return secp256k1.verify(msg, sigObj.signature, pubKey);
}

/**
 * Creates SHA1 hash of the input
 */
export function sha1(a: Buffer | Array<any> | string | number): Buffer {
    a = toBuffer(a);
    return createHash("sha1").update(a).digest();
}

/**
 * Creates SHA-3 hash of the input
 */
export function sha3(a: Buffer | Array<any> | string | number, bits = 256): Buffer {
    a = toBuffer(a);
    return createKeccakHash("keccak" + bits).update(a).digest();
}

/**
 * Creates SHA256 hash of the input
 */
export function sha256(a: Buffer | Array<any> | string | number): Buffer {
    a = toBuffer(a);
    return createHash("sha256").update(a).digest();
}

export function doubleSha256(a: Buffer | Array<any> | string | number): Buffer {
    return sha256(sha256(a));
}

/**
 * Creates RIPEMD160 hash of the input
 */
export function ripemd160(a: Buffer | Array<any> | string | number, padded: boolean): Buffer {
    a = toBuffer(a);
    const hash = createHash("rmd160").update(a).digest();
    if (padded === true) {
        return setLengthLeft(hash, 32);
    } else {
        return hash;
    }
}
