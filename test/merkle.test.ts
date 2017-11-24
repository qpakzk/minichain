import { blockMerkleRoot } from "../src/merkle";
import { createCoinbaseTx } from "../src/transaction";
import { sha256 } from "../src/utilities";

const txs = [1, 2, 3, 4, 5, 6].map(i => {
    return { serialize: () => new Buffer(i.toString()) };
});

test("signle hash", () => {
    const merkleRoot = blockMerkleRoot([txs[0]]);
    expect(merkleRoot).toEqual(sha256(txs[0].serialize()));
});

test("odd number of hashes", () => {
    // If the number of hashes in the list at a given time
    // is odd, the last one is duplicated before computing the next level.
    const merkleRoot1 = blockMerkleRoot([txs[0], txs[1], txs[2]]);
    const merkleRoot2 = blockMerkleRoot([txs[0], txs[1], txs[2], txs[2]]);
    expect(merkleRoot1).toEqual(merkleRoot2);
});

test("duplicate txids", () => {
    // If the number of hashes in the list at a given time
    // is odd, the last one is duplicated before computing the next level.
    const merkleRoot1 = blockMerkleRoot(txs); // 1,2,3,4,5,6
    const merkleRoot2 = blockMerkleRoot(txs.concat(txs.slice(4, 6))); // 1,2,3,4,5,6,5,6
    expect(merkleRoot1).toEqual(merkleRoot2);
});
