import { bufferToHex } from "./buffer";
import { doubleSha256, sign } from "./crypto";
import { EMPTY_SCRIPT_SIG, Serializable, TxHash, TxInput, TxOutput } from "./types";

export abstract class Tx implements Serializable {
    constructor(private readonly _outputs: TxOutput[]) {
    }

    public abstract withEmptyInputScripts(): Tx;

    public serialize(): Buffer {
        return new Buffer(this.toString());
    }

    public abstract toString(): string;

    public get outputs(): TxOutput[] {
        return this._outputs;
    }

    public get valueOut(): number {
        let number = 0;
        for (const txOut of this.outputs) {
            number += txOut.value;
        }
        return number;
    }

    public get hash(): TxHash {
        return doubleSha256(this.serialize());
    }

    public get hashString(): string {
        return bufferToHex(this.hash);
    }

    public sig(privKey: Buffer): Buffer {
        return sign(this.withEmptyInputScripts().hash, privKey).signature;
    }
}

export class CoinbaseTx extends Tx {
    constructor(outputs: TxOutput[]) {
        super(outputs);
    }

    public toString(): string {
        return JSON.stringify({ outputs: this.outputs });
    }

    public withEmptyInputScripts(): Tx {
        return this;
    }
}

export class NormalTx extends Tx {
    constructor(private readonly _inputs: TxInput[], outputs: TxOutput[]) {
        super(outputs);
    }

    public toString(): string {
        return JSON.stringify({
            inputs: this.inputs,
            outputs: this.outputs
        });
    }

    public withEmptyInputScripts() {
        const newInputs = this.inputs.map(({ prevOut }) => {
            return {
                prevOut,
                scriptSig: EMPTY_SCRIPT_SIG
            };
        });
        return new NormalTx(newInputs, this.outputs);
    }

    public get inputs(): TxInput[] {
        return this._inputs;
    }
}

export function isCoinbaseTx(t: Tx): t is CoinbaseTx {
    return t instanceof CoinbaseTx;
}

export function isNormalTx(t: Tx): t is NormalTx {
    return t instanceof NormalTx;
}
