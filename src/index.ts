import { blockHash } from "./block";
import { CoinsView } from "./coins";
import { generatePrivKey, getPubKey } from "./crypto";
import { createNewBlock } from "./miner";
import { payToPubKeyHash } from "./script";
import { NormalTx, Tx } from "./tx";
import { EMPTY_SCRIPT_SIG, OutPoint } from "./types";
import { connectBlock } from "./validation";

// FIXME: Support multiple inputs and outputs.
function sendTx(fromPrivKey: Buffer, toPubKey: Buffer, value: number, prevOut: OutPoint): Tx {
    const outputs = [{
        value,
        txOutScript: payToPubKeyHash(toPubKey)
    }];
    const sig = new NormalTx([{
        prevOut,
        scriptSig: EMPTY_SCRIPT_SIG
    }], outputs).sig(fromPrivKey);

    const inputs = [{
        prevOut,
        scriptSig: {
            sig,
            pubKey: getPubKey(fromPrivKey)
        }
    }];
    return new NormalTx(inputs, outputs);
}

function main() {
    const privKey1 = generatePrivKey();
    const pubKey1 = getPubKey(privKey1);
    const privKey2 = generatePrivKey();
    const pubKey2 = getPubKey(privKey2);
    const privKey3 = generatePrivKey();
    const pubKey3 = getPubKey(privKey3);

    const view = new CoinsView();

    const script1 = payToPubKeyHash(pubKey1);
    const genesisBlock = createNewBlock(script1);
    connectBlock(genesisBlock, view);

    const prevTx = genesisBlock.txs[0];

    const tx1 = sendTx(privKey1, pubKey2, 50, { hash: prevTx.hash, index: 0 });
    const tx2 = sendTx(privKey2, pubKey3, 49, { hash: tx1.hash, index: 0 });
    const tx3 = sendTx(privKey3, pubKey1, 48, { hash: tx2.hash, index: 0 });

    const script2 = payToPubKeyHash(pubKey2);
    const prevHash = blockHash(genesisBlock.header);
    const block1 = createNewBlock(script2, [tx1, tx2, tx3], prevHash);
    const res = connectBlock(block1, view);
    console.log(res);
}

main();
