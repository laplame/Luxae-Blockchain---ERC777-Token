// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal ERC1820 Registry implementation for local testing
 * Based on EIP-1820: Pseudo-introspection Registry
 */
contract ERC1820Registry {
    mapping(address => mapping(bytes32 => address)) private _implementers;
    mapping(address => address) private _managers;

    event InterfaceImplementerSet(
        address indexed account,
        bytes32 indexed interfaceHash,
        address indexed implementer
    );
    event ManagerChanged(address indexed account, address indexed newManager);

    function setInterfaceImplementer(
        address account,
        bytes32 _interfaceHash,
        address implementer
    ) external {
        require(
            msg.sender == account ||
                msg.sender == _managers[account] ||
                account == address(0),
            "ERC1820: account is not the caller or manager"
        );
        _implementers[account][_interfaceHash] = implementer;
        emit InterfaceImplementerSet(account, _interfaceHash, implementer);
    }

    function getInterfaceImplementer(
        address account,
        bytes32 _interfaceHash
    ) external view returns (address) {
        return _implementers[account][_interfaceHash];
    }

    function setManager(address account, address newManager) external {
        require(
            msg.sender == account || msg.sender == _managers[account],
            "ERC1820: account is not the caller or manager"
        );
        _managers[account] = newManager;
        emit ManagerChanged(account, newManager);
    }

    function getManager(address account) external view returns (address) {
        return _managers[account];
    }

    function interfaceHash(string calldata interfaceName) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(interfaceName));
    }
}
