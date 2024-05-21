import { ethers } from "hardhat"

async function main() {
  const RouletteContract  = await ethers.getContractFactory("RouletteContract")
  const deploy = await RouletteContract.deploy()
  console.log("Contract deploy at: %s", await deploy.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})