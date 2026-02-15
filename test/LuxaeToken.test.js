const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployERC1820Registry } = require("./setup");

describe("LuxaeToken", function () {
  let luxaeToken;
  let owner;
  let addr1;
  let addr2;

  before(async function () {
    // Deploy ERC1820 Registry once before all tests
    await deployERC1820Registry();
  });

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const LuxaeToken = await ethers.getContractFactory("LuxaeToken");
    luxaeToken = await LuxaeToken.deploy([]);
    await luxaeToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await luxaeToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await luxaeToken.balanceOf(owner.address);
      const totalSupply = await luxaeToken.totalSupply();
      expect(ownerBalance).to.equal(totalSupply);
    });

    it("Should have correct name and symbol", async function () {
      expect(await luxaeToken.name()).to.equal("Luxae");
      expect(await luxaeToken.symbol()).to.equal("LUXAE");
    });

    it("Should have 18 decimals", async function () {
      expect(await luxaeToken.decimals()).to.equal(18);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("100");
      await luxaeToken.transfer(addr1.address, amount);

      const addr1Balance = await luxaeToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(amount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await luxaeToken.balanceOf(owner.address);
      const amount = ethers.parseEther("10000000000"); // More than total supply

      await expect(
        luxaeToken.transfer(addr1.address, amount)
      ).to.be.reverted;

      expect(await luxaeToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update balances after transfers", async function () {
      const amount = ethers.parseEther("100");
      const initialOwnerBalance = await luxaeToken.balanceOf(owner.address);

      await luxaeToken.transfer(addr1.address, amount);
      await luxaeToken.connect(addr1).transfer(addr2.address, amount);

      const finalOwnerBalance = await luxaeToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - amount);

      const addr2Balance = await luxaeToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(amount);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint new tokens", async function () {
      const amount = ethers.parseEther("1000");
      const initialSupply = await luxaeToken.totalSupply();

      await luxaeToken.mint(addr1.address, amount, "0x", "0x");
      
      const newSupply = await luxaeToken.totalSupply();
      expect(newSupply).to.equal(initialSupply + amount);
      
      const addr1Balance = await luxaeToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(amount);
    });

    it("Should fail if non-owner tries to mint", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        luxaeToken.connect(addr1).mint(addr2.address, amount, "0x", "0x")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their own tokens", async function () {
      const transferAmount = ethers.parseEther("1000");
      const burnAmount = ethers.parseEther("100");
      
      await luxaeToken.transfer(addr1.address, transferAmount);
      const initialBalance = await luxaeToken.balanceOf(addr1.address);
      const initialSupply = await luxaeToken.totalSupply();

      await luxaeToken.connect(addr1).burn(burnAmount, "0x");
      
      const finalBalance = await luxaeToken.balanceOf(addr1.address);
      const finalSupply = await luxaeToken.totalSupply();
      
      expect(finalBalance).to.equal(initialBalance - burnAmount);
      expect(finalSupply).to.equal(initialSupply - burnAmount);
    });
  });

  describe("ERC777 Features", function () {
    it("Should support operator authorization", async function () {
      const amount = ethers.parseEther("100");
      await luxaeToken.transfer(addr1.address, amount);

      // Authorize addr2 as operator for addr1
      await luxaeToken.connect(addr1).authorizeOperator(addr2.address);
      
      const isOperator = await luxaeToken.isOperatorFor(addr2.address, addr1.address);
      expect(isOperator).to.be.true;
    });

    it("Should allow operators to send tokens", async function () {
      const amount = ethers.parseEther("100");
      await luxaeToken.transfer(addr1.address, amount);

      // Authorize addr2 as operator
      await luxaeToken.connect(addr1).authorizeOperator(addr2.address);
      
      // Operator sends tokens on behalf of addr1
      await luxaeToken.connect(addr2).operatorSend(
        addr1.address,
        addr2.address,
        amount,
        "0x",
        "0x"
      );

      const addr2Balance = await luxaeToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(amount);
    });
  });
});
