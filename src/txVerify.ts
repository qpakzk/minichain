import { moneyRange } from "./amount";
import { BN_ZERO, bufferToBN } from "./buffer";
import { CoinsView } from "./coins";
import { combineScript, interpret, scriptSig } from "./script";
import { NormalTx, Tx, isNormalTx } from "./tx";

/**
 * Check whether all inputs of this transaction are valid (no double spends and amounts)
 * This does not modify the UTXO set. This does not check scripts and sigs.
 */
function checkTxInputs(tx: NormalTx, inputs: CoinsView): boolean {
    if (!inputs.hasInputs(tx)) {
        console.log("bad-txns-inputs-missingorspent");
        return false;
    }

    let valueIn = 0;
    for (let i = 0; i < tx.inputs.length; ++i) {
        const prevOut = tx.inputs[i].prevOut;
        const coin = inputs.getCoin(prevOut);

        // Check for negative or overflow input values
        valueIn += coin.out.value;
        if (!moneyRange(coin.out.value) || !moneyRange(valueIn)) {
            console.log("bad-txns-inputvalues-outofrange");
            return false;
        }
    }

    const valueOut = tx.valueOut;
    if (valueIn < valueOut) {
        console.log("bad-txns-in-belowout");
        return false;
    }

    // Tally transaction fees
    const txFee = valueIn - valueOut;
    if (!moneyRange(txFee)) {
        console.log("bad-txns-fee-outofrange");
        return false;
    }

    return true;
}

export function verifyTx(tx: Tx, inputs: CoinsView): boolean {
    if (!isNormalTx(tx))
        return true;

    if (!checkTxInputs(tx, inputs))
        return false;

    return tx.inputs.every(input => {
        const output = inputs.getCoin(input.prevOut).out;
        const script = combineScript(scriptSig(input.scriptSig), output.txOutScript);
        const env = interpret(script, tx, input.prevOut.index);
        if (!env.isTxValid()) {
            console.log("bad-tx");
            return false;
        }

        return !bufferToBN(env.top).eq(BN_ZERO);
    });
}
