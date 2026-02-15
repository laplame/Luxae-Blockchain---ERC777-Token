// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LuxaeToken
 * @dev ERC777 token implementation for Luxae
 * ERC777 provides advanced features like operator management and hooks
 */
contract LuxaeToken is ERC777, Ownable {
    uint256 private _totalSupply;
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18; // 1 billion tokens with 18 decimals

    /**
     * @dev Constructor that sets up the ERC777 token
     * @param defaultOperators Array of addresses that are default operators for all token holders
     */
    constructor(
        address[] memory defaultOperators
    ) 
        ERC777("Luxae", "LUXAE", defaultOperators)
        Ownable()
    {
        _totalSupply = INITIAL_SUPPLY;
        _mint(msg.sender, INITIAL_SUPPLY, "", "");
    }

    /**
     * @dev Returns the total supply of tokens
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     * @param userData Optional data to pass to recipient hooks
     * @param operatorData Optional data to pass to operator hooks
     */
    function mint(
        address to,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    ) public onlyOwner {
        _mint(to, amount, userData, operatorData);
        _totalSupply += amount;
    }

    /**
     * @dev Burn tokens from caller's account
     * @param amount Amount of tokens to burn
     * @param data Optional data to pass to hooks
     */
    function burn(uint256 amount, bytes memory data) public override {
        _burn(msg.sender, amount, data, "");
        _totalSupply -= amount;
    }

    /**
     * @dev Burn tokens from a specific account (requires operator authorization)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     * @param data Optional data to pass to hooks
     * @param operatorData Optional data to pass to operator hooks
     */
    function operatorBurn(
        address from,
        uint256 amount,
        bytes memory data,
        bytes memory operatorData
    ) public override {
        _burn(from, amount, data, operatorData);
        _totalSupply -= amount;
    }
}
