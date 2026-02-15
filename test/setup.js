const { ethers } = require("hardhat");

// ERC1820 Registry address (standard address on all networks)
const ERC1820_REGISTRY_ADDRESS = "0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24";

async function deployERC1820Registry() {
  const code = await ethers.provider.getCode(ERC1820_REGISTRY_ADDRESS);
  if (code === "0x") {
    // Get the first account (will be used to deploy)
    const [deployer] = await ethers.getSigners();
    
    // Calculate the address where the registry will be deployed
    // We'll use a deterministic deployment approach
    const ERC1820Registry = await ethers.getContractFactory("ERC1820Registry");
    
    // Deploy the registry
    const registry = await ERC1820Registry.deploy();
    await registry.waitForDeployment();
    
    const registryAddress = await registry.getAddress();
    console.log("ERC1820 Registry deployed to:", registryAddress);
    
    // If we're on hardhat network, we can set the code at the standard address
    if (network.name === "hardhat" || network.name === "localhost") {
      const registryCode = await ethers.provider.getCode(registryAddress);
      await ethers.provider.send("hardhat_setCode", [
        ERC1820_REGISTRY_ADDRESS,
        registryCode,
      ]);
      console.log("ERC1820 Registry code set at standard address");
    }
    
    return registryAddress;
  }
  return ERC1820_REGISTRY_ADDRESS;
}

module.exports = { deployERC1820Registry, ERC1820_REGISTRY_ADDRESS };
