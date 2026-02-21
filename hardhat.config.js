require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      // Pre-deploy ERC1820 Registry for ERC777 support
      initialBaseFeePerGas: 0,
      // Configuración personalizada de gas para Luxae Blockchain
      gasPrice: 20000000000, // 20 gwei
      gas: 30000000, // 30M gas limit
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      gasPrice: 20000000000, // 20 gwei - precio personalizado
    },
    luxae: {
      url: process.env.LUXAE_RPC_URL || "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei - precio personalizado de gas
      gas: 30000000, // 30M gas limit personalizado
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
