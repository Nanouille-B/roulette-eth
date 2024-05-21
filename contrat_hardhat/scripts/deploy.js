const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Connecting to the local blockchain provided by Hardhat
const web3 = new Web3.Web3('http://127.0.0.1:8545');

// Path to the contract JSON output by the Hardhat compilation process
const contractPath = path.resolve(__dirname, '../artifacts/contracts/RouletteContract.sol/RouletteContract.json');
const { abi, bytecode } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

async function main() {
  // Get the accounts from the local node
  const accounts = await web3.eth.getAccounts();
  const deployer = accounts[0];

  console.log("Deploying contracts with the account:", deployer);

  // Check balance
  const balance = await web3.eth.getBalance(deployer);
  console.log("Account balance:", web3.utils.fromWei(balance, 'ether'));

  // Create a new contract instance
  const RouletteContract = new web3.eth.Contract(abi);

  // Deploy the contract
  const simpleContract = await RouletteContract.deploy({
    data: bytecode,
  })
  .send({
    from: deployer,
    gas: '3000000', // Set an appropriate gas limit
    gasPrice: await web3.eth.getGasPrice()
  });

  console.log("RouletteContract deployed at address:", simpleContract.options.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
