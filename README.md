MiniChain
=========
MiniChain is a PoC cryptocurrency implementation written to illustrate the basic components of a Proof-of-Work based, public blockchain technology.

Project goals:
- Well-documented
- Low-dependencies
- Using classic proof-of-work
- UTXO
- In-memory

# Consensus

MiniChain uses a simple proof of work (PoW) approach to chain consnesus. To mine a block on the chain, a node must compute a nonce such taht the resulting hash of the block being mined begins with four zeros. The mining difficulty is not adjusted.

# Setup

```
$ yarn install
```

# Build

```
$ tsc
```

# Run

```
$ node ./out/index.js
```
