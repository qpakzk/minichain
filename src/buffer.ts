/// <reference path="./bn.js.d.ts" />

import BN = require("bn.js");

export const BN_ZERO = new BN(0);

/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined and `BN`.
 * @param {*} v the value
 */
export function toBuffer(v: Buffer | string | number | null | undefined | BN | Array<any>): Buffer {
    if (!Buffer.isBuffer(v)) {
        if (Array.isArray(v)) {
            v = Buffer.from(v);
        } else if (typeof v === "string") {
            if (isHexString(v)) {
                v = Buffer.from(padToEven(stripHexPrefix(v)), "hex");
            } else {
                v = Buffer.from(v);
            }
        } else if (typeof v === "number") {
            v = intToBuffer(v);
        } else if (v === null || v === undefined) {
            v = Buffer.allocUnsafe(0);
        } else {
            throw new Error("invalid type");
        }
    }
    return v;
}

/**
 * Converts a `Buffer` into a hex `String`
 */
export function bufferToHex(buf: Buffer): string {
    buf = toBuffer(buf);
    return "0x" + buf.toString("hex");
}

/**
 * Converts a `Buffer` to a `BN`
 */
export function bufferToBN(buf: Buffer): BN {
    return new BN(exports.toBuffer(buf));
}

/**
 * Is the string a hex string.
 */
export function isHexString(value: string, length?: number): boolean {
    if (!value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }

    if (length && value.length !== 2 + 2 * length) { return false; }

    return true;
}

/**
 * Converts an `Number` to a `Buffer`
 */
export function intToBuffer(i: number): Buffer {
    const hex = intToHex(i);
    return new Buffer(hex.slice(2), "hex");
}

/**
 * Converts an 'Boolean' to a 'Buffer'.
 */
export function booleanToBuffer(b: boolean): Buffer {
    const i = b ? 1 : 0;
    return intToBuffer(i);
}

/**
 * Converts a `Number` into a hex `String`
 */
export function intToHex(i: number): string {
    const hex = i.toString(16);
    return `0x${padToEven(hex)}`;
}

/**
 * Pads a `String` to have an even length
 */
export function padToEven(value: string): string {
    let a = value;

    if (a.length % 2) {
        a = `0${a}`;
    }

    return a;
}

/**
 * Removes '0x' from a given `String` if present
 */
export function stripHexPrefix(str: string): string {
    return isHexPrefixed(str) ? str.slice(2) : str;
}

/**
 * Returns a `Boolean` on whether or not the a `String` starts with '0x'
 */
export function isHexPrefixed(str: string): boolean {
    return str.slice(0, 2) === "0x";
}

/**
 * Left Pads an `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 */
export function setLengthLeft(msg: Buffer, length: number, right = false): Buffer {
    const buf = zeros(length);
    msg = toBuffer(msg);
    if (right) {
        if (msg.length < length) {
            msg.copy(buf);
            return buf;
        }
        return msg.slice(0, length);
    } else {
        if (msg.length < length) {
            msg.copy(buf, length - msg.length);
            return buf;
        }
        return msg.slice(-length);
    }
}

/**
 * Returns a buffer filled with 0s
 */
function zeros(bytes: number): Buffer {
    return Buffer.allocUnsafe(bytes).fill(0);
}
