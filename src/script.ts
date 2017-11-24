import { BN_ZERO, booleanToBuffer, bufferToBN } from "./buffer";
import { ripemd160, sha1, sha256, verify } from "./crypto";
import { Tx } from "./tx";
import { Op, Script, ScriptSig } from "./types";

export function opPush(literal: Buffer): Op {
    return { opcode: "push", literal };
}

export function opDup(): Op {
    return { opcode: "dup" };
}

export function opSha256(): Op {
    return { opcode: "sha256" };
}

export function opHash160(): Op {
    return { opcode: "hash160" };
}

export function opSha1(): Op {
    return { opcode: "sha1" };
}

export function opGeq(): Op {
    return { opcode: "geq" };
}

export function opEq(): Op {
    return { opcode: "eq" };
}

export function opVerify(): Op {
    return { opcode: "verify" };
}

export function opChecksig(): Op {
    return { opcode: "checksig" };
}

export function opIf(): Op {
    return { opcode: "if" };
}

export function combineScript(s1: Script, s2: Script): Script {
    return [].concat(s1, s2);
}

export function interpret(script: Script, tx: Tx, txPrevOutIndex: number): Env {
    const env = new Env([], tx, txPrevOutIndex);
    for (const op of script) {
        switch (op.opcode) {
            case "push":
                env.push(op.literal);
                break;
            case "checksig":
                {
                    if (env.stack.length < 2)
                        throw new StackUnderflow();
                    const [pubKey, sig] = env.stack;
                    env.replace2(booleanToBuffer(verify(env.tx.withEmptyInputScripts().hash, { signature: sig }, pubKey)));
                    break;
                }
            case "verify":
                if (bufferToBN(env.top).eq(BN_ZERO)) {
                    env.pop();
                    env.invalidate();
                    return env;
                } else {
                    env.pop();
                }
                break;
            case "dup":
                env.push(Buffer.from(env.top));
                break;
            case "sha256":
                env.replace(sha256(env.top));
                break;
            case "sha1":
                env.replace(sha1(env.top));
                break;
            case "hash160":
                env.replace(ripemd160(sha256(env.top), false));
                break;
            case "geq":
                {
                    if (env.stack.length < 2)
                        throw new StackUnderflow();
                    const [x, y] = env.stack;
                    env.replace2(booleanToBuffer(bufferToBN(x).gte(bufferToBN(y))));
                    break;
                }
            case "eq":
                {
                    if (env.stack.length < 2)
                        throw new StackUnderflow();
                    const [x, y] = env.stack;
                    env.replace2(booleanToBuffer(bufferToBN(x).eq(bufferToBN(y))));
                    break;
                }
            case "if":
                {
                    if (env.stack.length < 3)
                        throw new StackUnderflow();
                    const [x, y, z] = env.stack;
                    env.replace3(bufferToBN(x).eq(BN_ZERO) ? y : z);
                    break;
                }
        }
    }
    return env;
}

class StackUnderflow extends Error { }

export class Env {
    private txValid = true;

    constructor(public readonly stack: Buffer[],
        public readonly tx: Tx,
        public readonly txPrevOutIndex: number) {
    }

    public isTxValid(): boolean {
        return this.txValid;
    }

    public invalidate() {
        this.txValid = false;
    }

    public get top(): Buffer {
        if (this.stack.length === 0)
            throw new StackUnderflow();
        return this.stack[0];
    }

    public replace(x: Buffer) {
        if (this.stack.length === 0)
            throw new StackUnderflow();
        this.stack[0] = x;
    }

    public replace2(x: Buffer) {
        if (this.stack.length === 0)
            throw new StackUnderflow();
        this.stack.shift();
        this.stack[0] = x;
    }

    public replace3(x: Buffer) {
        if (this.stack.length === 0)
            throw new StackUnderflow();
        this.stack.shift();
        this.stack.shift();
        this.stack[0] = x;
    }

    public push(x: Buffer) {
        this.stack.unshift(x);
    }

    public pop(): Buffer {
        if (this.stack.length === 0)
            throw new StackUnderflow();
        return this.stack.shift();
    }
}

export function payToPubKeyHash(recipientPubKey: Buffer): Script {
    const recipientPubKeyHash = ripemd160(sha256(recipientPubKey), false);
    return [opDup(), opHash160(), opPush(recipientPubKeyHash), opEq(), opVerify(), opChecksig()];
}

export function scriptSig(ss: ScriptSig): Script {
    return [opPush(ss.sig), opPush(ss.pubKey)];
}
