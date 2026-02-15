const { ethers } = require("hardhat");
const { deployERC1820Registry } = require("../test/setup");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying LuxaeToken...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy ERC1820 Registry if needed (for local networks)
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 1337n || network.name === "hardhat" || network.name === "localhost") {
    console.log("Deploying ERC1820 Registry for local network...");
    await deployERC1820Registry();
  }

  // Deploy with empty default operators array (can be customized)
  // You can add operator addresses here if needed
  const defaultOperators = [];
  
  const LuxaeToken = await ethers.getContractFactory("LuxaeToken");
  const luxaeToken = await LuxaeToken.deploy(defaultOperators);

  await luxaeToken.waitForDeployment();

  const tokenAddress = await luxaeToken.getAddress();
  console.log("LuxaeToken deployed to:", tokenAddress);
  console.log("Token name:", await luxaeToken.name());
  console.log("Token symbol:", await luxaeToken.symbol());
  console.log("Total supply:", (await luxaeToken.totalSupply()).toString());
  console.log("Owner:", await luxaeToken.owner());

  // Guardar configuración del contrato en archivo JSON
  const config = {
    contractAddress: tokenAddress,
    network: network.name || 'localhost',
    rpcUrl: network.name === 'localhost' || network.chainId === 1337n ? 'http://127.0.0.1:8545' : '',
    chainId: network.chainId ? network.chainId.toString() : '1337',
    deployedAt: new Date().toISOString(),
    tokenName: await luxaeToken.name(),
    tokenSymbol: await luxaeToken.symbol(),
    totalSupply: (await luxaeToken.totalSupply()).toString(),
    owner: await luxaeToken.owner()
  };

  const configPath = path.join(__dirname, '..', 'frontend', 'contract-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("\n✅ Configuración guardada en:", configPath);
  console.log("   El frontend cargará automáticamente esta configuración.");
  console.log("\n📋 Información del despliegue:");
  console.log("   - Contrato:", tokenAddress);
  console.log("   - Red:", config.network);
  console.log("   - Chain ID:", config.chainId);
  if (config.rpcUrl) {
    console.log("   - RPC URL:", config.rpcUrl);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
