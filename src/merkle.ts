import { sha256 } from "./crypto";
import { Serializable } from "./types";

/*
 * Compute the Merkle root of the transactions in a block.
 */
export function blockMerkleRoot(txs: Serializable[]): Buffer {
    function merkleRoot(hashes: Buffer[]): Buffer {
        if (hashes.length === 1)
            return hashes[0];

        if (hashes.length % 2 !== 0) {
            const lastHash = hashes[hashes.length - 1];
            hashes.push(lastHash);
        }

        const nextHashes: Buffer[] = [];
        for (let i = 0; i < hashes.length; i += 2)
            nextHashes.push(sha256(Buffer.concat([hashes[i], hashes[i + 1]])));

        return merkleRoot(nextHashes);
    }

    const hashes = txs.map(tx => sha256(tx.serialize()));
    return merkleRoot(hashes);
}
