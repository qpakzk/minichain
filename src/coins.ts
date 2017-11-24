import { bufferToHex } from "./buffer";
import { Tx, isCoinbaseTx, isNormalTx } from "./tx";
import { OutPoint, TxOutput } from "./types";

export class Coin {
    private spent = false;

    constructor(
        private readonly outIn: TxOutput,
        private readonly coinBase: boolean) {
    }

    public get out(): TxOutput {
        return this.outIn;
    }

    public isSpent(): boolean {
        return this.spent;
    }

    public setSpent() {
        this.spent = true;
    }

    public isCoinBase(): boolean {
        return this.coinBase;

    }
}

export class CoinsView {
    private map: Map<string, Coin>;

    constructor(private base?: CoinsView) {
        this.map = base ? new Map(base.map) : new Map();
    }

    public getCoin(outPoint: OutPoint): Coin | undefined {
        const key = outPointHash(outPoint);
        const coin = this.map.get(key);
        if (!coin || coin.isSpent())
            return undefined;

        return this.map.get(key);
    }

    public hasCoin(outPoint: OutPoint): boolean {
        const key = outPointHash(outPoint);
        const coin = this.map.get(key);
        if (coin && !coin.isSpent())
            return true;

        return false;
    }

    public addCoin(outPoint: OutPoint, coin: Coin) {
        const key = outPointHash(outPoint);
        return this.map.set(key, coin);
    }

    public spendCoin(outPoint: OutPoint) {
        const key = outPointHash(outPoint);
        const coin = this.map.get(key);
        if (coin) {
            coin.setSpent();
            this.map.delete(key);
        }
    }

    // FIXME: Implement valueIn.
    /**
     * Returns the amount of coins coming in to a transaction.
     */
    public valueIn(_tx: Tx): number {
        throw new Error("Not implemented");
    }

    /**
     * Check whether all prevouts of the transaction are present
     * in the UTXO set represented by this view.
     */
    public hasInputs(tx: Tx): boolean {
        if (isNormalTx(tx)) {
            for (const txin of tx.inputs) {
                if (!this.hasCoin(txin.prevOut)) {
                    return false;
                }
            }
        }

        return true;
    }

    public flush() {
        this.base.map = this.map;
    }
}

function outPointHash(outPoint: OutPoint): string {
    return bufferToHex(outPoint.hash) + outPoint.index;
}

export function addCoins(cache: CoinsView, tx: Tx) {
    const coinBase = isCoinbaseTx(tx);
    const txid = tx.hash;
    for (let i = 0; i < tx.outputs.length; i++) {
        cache.addCoin({ hash: txid, index: i }, new Coin(tx.outputs[i], coinBase));
    }
}

export function updateCoins(tx: Tx, inputs: CoinsView) {
    if (isNormalTx(tx)) {
        for (const txin of tx.inputs) {
            inputs.spendCoin(txin.prevOut);
        }
    }
    addCoins(inputs, tx);
}
