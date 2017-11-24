export interface Push {
    opcode: "push";
    literal: Buffer;
}

export interface Dup {
    opcode: "dup";
}

export interface Sha256 {
    opcode: "sha256";
}

export interface Hash160 {
    opcode: "hash160";
}

export interface Sha1 {
    opcode: "sha1";
}

export interface Geq {
    opcode: "geq";
}

export interface Eq {
    opcode: "eq";
}

export interface Verify {
    opcode: "verify";
}

export interface Checksig {
    opcode: "checksig";
}

export interface If {
    opcode: "if";
}

export type Op = Push | Dup | Sha256 | Hash160 | Sha1 | Geq | Eq | Verify | Checksig | If;

export type Script = Op[];

export type TxHash = Buffer;

export interface Serializable {
    serialize: () => Buffer;
}

export interface ScriptSig {
    sig: Buffer;
    pubKey: Buffer;
}

export interface OutPoint {
    hash: TxHash;
    index: number;
}

export interface TxInput {
    prevOut: OutPoint;
    scriptSig: ScriptSig;
}

export const EMPTY_SCRIPT_SIG: ScriptSig = {
    sig: Buffer.alloc(0),
    pubKey: Buffer.alloc(0)
};

export interface TxOutput {
    value: number;
    txOutScript: Script;
}
