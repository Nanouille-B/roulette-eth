# Roulette-ETH
This app is made using a React+Typescript+Vite template.

# Requirements

Make sure to have a blockchain running on `localhost:8545`.

# Installation

First clone the repository:
```bash
git clone 
```

Then, install the dependencies in the `contrat_hardhat` folder and deploy the contract:
```bash
cd roulette-eth/contrat_hardhat && npm install && npx hardhat run scripts/deploy.js --network localhost && cd ..
```
Take note of the deployed contract address. You will have to write it in `roulette-eth/src/NumberRoulette.tsx:35`

Then you have to download the dependencies for the React app before starting it.
```bash
npm install && npm run dev
```