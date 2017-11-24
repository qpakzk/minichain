import { sha256 } from "./crypto";
import { Tx } from "./tx";

export interface BlockHeader {
    prevHash: Buffer;
    merkleRoot: Buffer;
    timestamp: Date;
    nounce: number;
}

export interface Block {
    header: BlockHeader;
    txs: Tx[];
}

export function blockHash(blockHeader: BlockHeader): Buffer {
    return sha256(sha256(new Buffer(JSON.stringify(blockHeader))));
}
