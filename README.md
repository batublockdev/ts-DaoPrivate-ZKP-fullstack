# 🗳️ Private DAO Voting with ZKPs

A fullstack DAO application that allows users to vote **privately** using a password-authenticated zero-knowledge proof system. Built with **TypeScript**, **PostgreSQL**, and **Solidity** smart contracts. Users create private votes that are never revealed, yet are verifiably counted on-chain using zk-SNARKs.

---

## 🔒 How It Works

1. **User Registration**  
   Users register with a unique identifier (e.g., email or wallet address) and a **password**.

2. **Vote Commitment**  
   When voting, the user's vote and password are **hashed** with their user ID and stored off-chain (PostgreSQL).

3. **ZK Proof Generation**  
   The client generates a **zero-knowledge proof** (e.g., using Circom + SnarkJS) based on:
   - User ID
   - Password
   - Vote option

4. **On-chain Verification**  
   The ZK proof is submitted to a Solidity smart contract. The contract **verifies** the proof without revealing the vote content.

5. **Tally**  
   Only valid, unique votes are counted, ensuring privacy and integrity.

---

## 🛠️ Tech Stack

| Layer       | Tech                                                                 |
|-------------|----------------------------------------------------------------------|
| Frontend    | Next.js + React + Tailwind                                           |
| ZK Proofs   | Circom + SnarkJS (Groth16 proving system)                            |
| Smart Contracts | Solidity (custom Governor-style voting contract)                 |
| Backend     | Node.js + Express (API layer)                                        |
| Database    | PostgreSQL (for storing vote commitments and hashed credentials)     |

---

## 📦 Installation

```bash
git clone https://github.com/your-username/private-dao-voting.git
cd private-dao-voting
pnpm install
```

### Environment Setup

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dao
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
PROVER_KEY_PATH=./zk/proving_key.zkey
VERIFIER_CONTRACT_PATH=./contracts/Verifier.sol
```

---

## ▶️ Usage

### Start Local Dev

```bash
pnpm dev
```

### Compile ZK Circuits

```bash
cd zk
circom vote.circom --r1cs --wasm --sym
snarkjs groth16 setup vote.r1cs pot15_final.ptau vote_0000.zkey
snarkjs zkey contribute vote_0000.zkey vote_final.zkey
snarkjs zkey export verificationkey vote_final.zkey verification_key.json
```

### Deploy Contracts

```bash
pnpm hardhat compile
pnpm hardhat deploy --network sepolia
```

---

## ✅ Features

- 🗳️ Fully private voting with password-authenticated ZK proofs
- 🔐 Secure hash-based commitment scheme
- 🧠 No vote ever stored or revealed on-chain
- 🧾 Audit-ready PostgreSQL storage of encrypted user activity
- 🌐 Web interface for proof generation & submission
- 🪙 DAO-compatible on-chain proposal system

---

## 📁 Project Structure

```
/contracts         --> Solidity contracts
/frontend          --> Next.js app
/backend           --> Node.js server & DB handlers
/zk                --> Circom circuit, keys & proof scripts
/prisma            --> PostgreSQL schema
```

---

## 🔮 Roadmap

- [ ] Add Merkle Tree membership checks for registered voters
- [ ] Add support for Tornado-style nullifier system (to prevent double-voting)
- [ ] Full integration with DAO proposal lifecycle (Create -> Vote -> Execute)

---

## 👥 Contributors

- batublockdev — Project Lead & Fullstack Developer  


---

## 📜 License

MIT License
---

## 🌐 Web App

Access the frontend application here: [DAO Voting Web App](https://ts-dao-private-zkp-fullstack.vercel.app/)

---

## 📄 Smart Contracts

The core contracts used in this project:

- [`VotingVerifier.sol`](https://github.com/batublockdev/privateDAO-ZKproof): Verifies zero-knowledge proofs generated off-chain.
