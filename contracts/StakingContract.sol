// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title StakingContract
 * @dev Contrato de staking personalizado para Luxae Blockchain
 * Permite a los usuarios hacer stake de tokens LUXAE y recibir recompensas
 */
contract StakingContract is Ownable, ReentrancyGuard {
    // Configuración de staking
    uint256 public minStakeAmount;
    uint256 public validatorRewardRate; // Porcentaje de recompensa para validadores (en base 10000, ej: 500 = 5%)
    uint256 public delegatorRewardRate; // Porcentaje de recompensa para delegadores (en base 10000)
    uint256 public unbondingPeriod; // Tiempo en segundos antes de poder retirar stake
    uint256 public maxValidators;
    
    // Referencia al token LUXAE
    address public luxaeToken;
    
    // Estructura de un validador
    struct Validator {
        address validatorAddress;
        uint256 totalStaked;
        uint256 selfStaked;
        uint256 delegatorStaked;
        bool isActive;
        uint256 createdAt;
        uint256 lastRewardBlock;
    }
    
    // Estructura de un delegador
    struct Delegator {
        address delegatorAddress;
        address validatorAddress;
        uint256 amount;
        uint256 stakedAt;
        uint256 unbondingEndTime;
        bool isUnbonding;
    }
    
    // Mapeos
    mapping(address => Validator) public validators;
    mapping(address => mapping(address => Delegator)) public delegators; // delegator => validator => Delegator
    mapping(address => uint256) public totalDelegatedToValidator; // validator => total delegated
    address[] public validatorList;
    
    // Eventos
    event ValidatorRegistered(address indexed validator, uint256 amount);
    event StakeDelegated(address indexed delegator, address indexed validator, uint256 amount);
    event StakeWithdrawn(address indexed staker, uint256 amount);
    event RewardsDistributed(address indexed validator, uint256 validatorReward, uint256 delegatorReward);
    event UnbondingStarted(address indexed delegator, address indexed validator, uint256 unbondingEndTime);
    
    constructor(
        address _luxaeToken,
        uint256 _minStakeAmount,
        uint256 _validatorRewardRate,
        uint256 _delegatorRewardRate,
        uint256 _unbondingPeriod,
        uint256 _maxValidators
    ) Ownable() {
        luxaeToken = _luxaeToken;
        minStakeAmount = _minStakeAmount;
        validatorRewardRate = _validatorRewardRate;
        delegatorRewardRate = _delegatorRewardRate;
        unbondingPeriod = _unbondingPeriod;
        maxValidators = _maxValidators;
    }
    
    /**
     * @dev Registrar un validador con stake inicial
     * @param stakeAmount Cantidad de tokens a hacer stake
     */
    function registerValidator(uint256 stakeAmount) external nonReentrant {
        require(stakeAmount >= minStakeAmount, "Stake amount below minimum");
        require(!validators[msg.sender].isActive, "Validator already registered");
        require(validatorList.length < maxValidators, "Maximum validators reached");
        
        // Transferir tokens al contrato
        require(
            IERC20(luxaeToken).transferFrom(msg.sender, address(this), stakeAmount),
            "Token transfer failed"
        );
        
        validators[msg.sender] = Validator({
            validatorAddress: msg.sender,
            totalStaked: stakeAmount,
            selfStaked: stakeAmount,
            delegatorStaked: 0,
            isActive: true,
            createdAt: block.timestamp,
            lastRewardBlock: block.number
        });
        
        validatorList.push(msg.sender);
        
        emit ValidatorRegistered(msg.sender, stakeAmount);
    }
    
    /**
     * @dev Delegar stake a un validador
     * @param validatorAddress Dirección del validador
     * @param amount Cantidad de tokens a delegar
     */
    function delegateStake(address validatorAddress, uint256 amount) external nonReentrant {
        require(validators[validatorAddress].isActive, "Validator not active");
        require(amount > 0, "Amount must be greater than 0");
        require(
            IERC20(luxaeToken).transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        Delegator storage delegator = delegators[msg.sender][validatorAddress];
        
        if (delegator.amount > 0) {
            // Actualizar stake existente
            delegator.amount += amount;
        } else {
            // Nuevo delegador
            delegators[msg.sender][validatorAddress] = Delegator({
                delegatorAddress: msg.sender,
                validatorAddress: validatorAddress,
                amount: amount,
                stakedAt: block.timestamp,
                unbondingEndTime: 0,
                isUnbonding: false
            });
        }
        
        validators[validatorAddress].totalStaked += amount;
        validators[validatorAddress].delegatorStaked += amount;
        totalDelegatedToValidator[validatorAddress] += amount;
        
        emit StakeDelegated(msg.sender, validatorAddress, amount);
    }
    
    /**
     * @dev Iniciar proceso de unbonding (retirar stake)
     * @param validatorAddress Dirección del validador del cual retirar stake
     */
    function startUnbonding(address validatorAddress) external nonReentrant {
        Delegator storage delegator = delegators[msg.sender][validatorAddress];
        require(delegator.amount > 0, "No stake to unbond");
        require(!delegator.isUnbonding, "Already unbonding");
        
        delegator.isUnbonding = true;
        delegator.unbondingEndTime = block.timestamp + unbondingPeriod;
        
        emit UnbondingStarted(msg.sender, validatorAddress, delegator.unbondingEndTime);
    }
    
    /**
     * @dev Retirar stake después del período de unbonding
     * @param validatorAddress Dirección del validador
     */
    function withdrawStake(address validatorAddress) external nonReentrant {
        Delegator storage delegator = delegators[msg.sender][validatorAddress];
        require(delegator.amount > 0, "No stake to withdraw");
        require(delegator.isUnbonding, "Must start unbonding first");
        require(block.timestamp >= delegator.unbondingEndTime, "Unbonding period not finished");
        
        uint256 amount = delegator.amount;
        
        // Actualizar estado del validador
        validators[validatorAddress].totalStaked -= amount;
        validators[validatorAddress].delegatorStaked -= amount;
        totalDelegatedToValidator[validatorAddress] -= amount;
        
        // Eliminar delegador
        delete delegators[msg.sender][validatorAddress];
        
        // Transferir tokens de vuelta
        require(
            IERC20(luxaeToken).transfer(msg.sender, amount),
            "Token transfer failed"
        );
        
        emit StakeWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Distribuir recompensas a validadores y delegadores
     * @param validatorAddress Dirección del validador
     */
    function distributeRewards(address validatorAddress) external {
        Validator storage validator = validators[validatorAddress];
        require(validator.isActive, "Validator not active");
        require(block.number > validator.lastRewardBlock, "No new blocks");
        
        uint256 totalReward = calculateReward(validatorAddress);
        uint256 validatorReward = (totalReward * validatorRewardRate) / 10000;
        uint256 delegatorReward = totalReward - validatorReward;
        
        // Transferir recompensa al validador
        if (validatorReward > 0) {
            require(
                IERC20(luxaeToken).transfer(validatorAddress, validatorReward),
                "Validator reward transfer failed"
            );
        }
        
        // Distribuir recompensas a delegadores (proporcional a su stake)
        if (delegatorReward > 0 && validator.delegatorStaked > 0) {
            // Nota: En producción, esto debería iterar sobre todos los delegadores
            // Por simplicidad, aquí solo actualizamos el estado
            // Una implementación completa requeriría un mapeo de delegadores por validador
        }
        
        validator.lastRewardBlock = block.number;
        
        emit RewardsDistributed(validatorAddress, validatorReward, delegatorReward);
    }
    
    /**
     * @dev Calcular recompensa basada en el stake total
     */
    function calculateReward(address validatorAddress) public view returns (uint256) {
        Validator memory validator = validators[validatorAddress];
        if (!validator.isActive || validator.totalStaked == 0) {
            return 0;
        }
        
        // Recompensa basada en bloques minados y stake total
        uint256 blocksSinceLastReward = block.number - validator.lastRewardBlock;
        uint256 baseReward = blocksSinceLastReward * 1 ether; // 1 token por bloque
        
        return baseReward;
    }
    
    /**
     * @dev Obtener lista de validadores activos
     */
    function getActiveValidators() external view returns (address[] memory) {
        return validatorList;
    }
    
    /**
     * @dev Obtener información de un validador
     */
    function getValidatorInfo(address validatorAddress) external view returns (
        address validatorAddr,
        uint256 totalStaked,
        uint256 selfStaked,
        uint256 delegatorStaked,
        bool isActive
    ) {
        Validator memory validator = validators[validatorAddress];
        return (
            validator.validatorAddress,
            validator.totalStaked,
            validator.selfStaked,
            validator.delegatorStaked,
            validator.isActive
        );
    }
    
    /**
     * @dev Actualizar configuración (solo owner)
     */
    function updateConfig(
        uint256 _minStakeAmount,
        uint256 _validatorRewardRate,
        uint256 _delegatorRewardRate,
        uint256 _unbondingPeriod,
        uint256 _maxValidators
    ) external onlyOwner {
        minStakeAmount = _minStakeAmount;
        validatorRewardRate = _validatorRewardRate;
        delegatorRewardRate = _delegatorRewardRate;
        unbondingPeriod = _unbondingPeriod;
        maxValidators = _maxValidators;
    }
}

// Interfaz mínima de ERC20
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
