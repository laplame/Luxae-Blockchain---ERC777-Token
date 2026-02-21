const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying StakingContract for Luxae Blockchain...");

  // Cargar configuración de staking
  const configPath = path.join(__dirname, '../blockchain/config.json');
  let stakingConfig = {
    minStakeAmount: "1000000000000000000000", // 1000 LUXAE
    validatorRewardRate: 500, // 5% (500/10000)
    delegatorRewardRate: 200, // 2% (200/10000)
    unbondingPeriod: 86400, // 24 horas
    maxValidators: 100
  };

  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.staking) {
      stakingConfig = {
        minStakeAmount: ethers.parseEther(config.staking.minStakeAmount || "1000"),
        validatorRewardRate: Math.floor(parseFloat(config.staking.validatorReward || "0.05") * 10000),
        delegatorRewardRate: Math.floor(parseFloat(config.staking.delegatorReward || "0.02") * 10000),
        unbondingPeriod: config.staking.unbondingPeriod || 86400,
        maxValidators: config.staking.maxValidators || 100
      };
    }
  }

  // Obtener cuenta desplegadora
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Obtener dirección del contrato LuxaeToken
  const contractConfigPath = path.join(__dirname, '../frontend/contract-config.json');
  let luxaeTokenAddress;
  
  if (fs.existsSync(contractConfigPath)) {
    const contractConfig = JSON.parse(fs.readFileSync(contractConfigPath, 'utf8'));
    luxaeTokenAddress = contractConfig.contractAddress;
    console.log("Using LuxaeToken at:", luxaeTokenAddress);
  } else {
    console.log("⚠️  LuxaeToken not deployed yet. Deploy it first with: npm run deploy:local");
    console.log("Using placeholder address. Update after deploying LuxaeToken.");
    luxaeTokenAddress = "0x0000000000000000000000000000000000000000";
  }

  // Desplegar StakingContract
  const StakingContract = await ethers.getContractFactory("StakingContract");
  const stakingContract = await StakingContract.deploy(
    luxaeTokenAddress,
    stakingConfig.minStakeAmount,
    stakingConfig.validatorRewardRate,
    stakingConfig.delegatorRewardRate,
    stakingConfig.unbondingPeriod,
    stakingConfig.maxValidators
  );

  await stakingContract.waitForDeployment();
  const stakingAddress = await stakingContract.getAddress();

  console.log("\n✅ StakingContract deployed!");
  console.log("Address:", stakingAddress);
  console.log("\nConfiguration:");
  console.log("  Min Stake Amount:", stakingConfig.minStakeAmount.toString(), "wei");
  console.log("  Validator Reward Rate:", stakingConfig.validatorRewardRate / 100, "%");
  console.log("  Delegator Reward Rate:", stakingConfig.delegatorRewardRate / 100, "%");
  console.log("  Unbonding Period:", stakingConfig.unbondingPeriod, "seconds");
  console.log("  Max Validators:", stakingConfig.maxValidators);

  // Guardar configuración
  const stakingConfigPath = path.join(__dirname, '../blockchain/staking-config.json');
  const stakingConfigData = {
    stakingContractAddress: stakingAddress,
    luxaeTokenAddress: luxaeTokenAddress,
    network: (await ethers.provider.getNetwork()).name || 'localhost',
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
    config: {
      minStakeAmount: stakingConfig.minStakeAmount.toString(),
      validatorRewardRate: stakingConfig.validatorRewardRate,
      delegatorRewardRate: stakingConfig.delegatorRewardRate,
      unbondingPeriod: stakingConfig.unbondingPeriod,
      maxValidators: stakingConfig.maxValidators
    }
  };

  fs.writeFileSync(stakingConfigPath, JSON.stringify(stakingConfigData, null, 2));
  console.log("\n✅ Configuration saved to:", stakingConfigPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
