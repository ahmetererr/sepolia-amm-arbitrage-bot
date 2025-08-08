/**
 * @title Zap2 - Cross-Token Arbitrage Contract
 * @author AMM Arbitrageur Project
 * @dev Smart contract for executing cross-token arbitrage on Uniswap V2
 * @notice This contract enables token conversion between DAI, WETH, and FOGG
 * @version 1.0.0
 */

//SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IWeth.sol"; 

/**
 * @dev Main arbitrage contract for cross-token conversions
 * @dev Supports DAI ↔ FOGG conversions via WETH bridge
 */
contract Zap2 {
    /** @dev WETH token address */
    address public WETH;
    
    /** @dev Contract owner address */
    address public owner;
    
    /** @dev Last arbitrage output amount */
    uint public amountOut;

    /**
     * @dev Modifier to restrict function access to owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev Constructor to initialize contract
     * @param _weth Address of WETH token
     */
    constructor(address _weth) {
        WETH = _weth;
        owner = msg.sender;
    }

    /**
     * @dev Executes DAI → WETH → FOGG arbitrage
     * @param router Uniswap V2 router address
     * @param dai DAI token address
     * @param fogg FOGG token address
     * @param amountIn Amount of DAI to convert
     * @return Amount of FOGG received
     */
    function arbitrageDaiToFogg(
        IUniswapV2Router02 router,
        address dai,
        address fogg,
        uint amountIn
    ) public onlyOwner returns (uint) {
        // Transfer DAI from user to contract
        IERC20(dai).transferFrom(msg.sender, address(this), amountIn);
        
        // Step 1: DAI → WETH
        IERC20(dai).approve(address(router), amountIn);
        address[] memory path1 = new address[](2);
        path1[0] = dai;
        path1[1] = WETH;
        uint[] memory amounts1 = router.swapExactTokensForTokens(
            amountIn,
            0,
            path1,
            address(this),
            block.timestamp
        );

        // Step 2: WETH → FOGG
        IERC20(WETH).approve(address(router), amounts1[1]);
        address[] memory path2 = new address[](2);
        path2[0] = WETH;
        path2[1] = fogg;
        uint[] memory amounts2 = router.swapExactTokensForTokens(
            amounts1[1],
            0,
            path2,
            address(this),
            block.timestamp
        );

        // Transfer FOGG back to owner
        IERC20(fogg).transfer(msg.sender, amounts2[1]);
        
        return amounts2[1];
    }

    /**
     * @dev Executes FOGG → WETH → DAI arbitrage
     * @param router Uniswap V2 router address
     * @param fogg FOGG token address
     * @param dai DAI token address
     * @param amountIn Amount of FOGG to convert
     * @return Amount of DAI received
     */
    function arbitrageFoggToDai(
        IUniswapV2Router02 router,
        address fogg,
        address dai,
        uint amountIn
    ) public onlyOwner returns (uint) {
        // Transfer FOGG from user to contract
        IERC20(fogg).transferFrom(msg.sender, address(this), amountIn);
        
        // Step 1: FOGG → WETH
        IERC20(fogg).approve(address(router), amountIn);
        address[] memory path1 = new address[](2);
        path1[0] = fogg;
        path1[1] = WETH;
        uint[] memory amounts1 = router.swapExactTokensForTokens(
            amountIn,
            0,
            path1,
            address(this),
            block.timestamp
        );

        // Step 2: WETH → DAI
        IERC20(WETH).approve(address(router), amounts1[1]);
        address[] memory path2 = new address[](2);
        path2[0] = WETH;
        path2[1] = dai;
        uint[] memory amounts2 = router.swapExactTokensForTokens(
            amounts1[1],
            0,
            path2,
            address(this),
            block.timestamp
        );

        // Transfer DAI back to owner
        IERC20(dai).transfer(msg.sender, amounts2[1]);
        
        return amounts2[1];
    }

    /**
     * @dev Original 2-token arbitrage function (for comparison)
     * @param router Uniswap V2 router address
     * @param path Token path for first swap
     * @param inversePath Token path for reverse swap (unused)
     * @param amountIn Amount of tokens to arbitrage
     * @return Amount received after arbitrage
     */
    function arbitrageV2ToV2(
        IUniswapV2Router02 router,
        address[] calldata path,
        address[] calldata inversePath, // This parameter is now unused in the contract logic
        uint amountIn
    ) public onlyOwner returns (uint) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        
        IERC20(path[0]).approve(address(router), amountIn);
        uint[] memory amounts1 = router.swapExactTokensForTokens(
            amountIn,
            0,
            path,
            address(this),
            block.timestamp
        );

        address[] memory reversePath = new address[](2);
        reversePath[0] = path[1];
        reversePath[1] = path[0];
        
        IERC20(path[1]).approve(address(router), amounts1[1]);
        uint[] memory amounts2 = router.swapExactTokensForTokens(
            amounts1[1],
            0,
            reversePath,
            address(this),
            block.timestamp
        );

        require(amounts2[1] > amountIn, "No profit");
        
        IERC20(path[0]).transfer(msg.sender, amounts2[1]);
        
        return amounts2[1];
    }

    /**
     * @dev WETH-based arbitrage function
     * @param router Uniswap V2 router address
     * @param path Token path for swaps
     * @param inversePath Token path for reverse swap (unused)
     * @param amountIn Amount of ETH to use (unused)
     * @return Amount received after arbitrage
     */
    function arbitrageWithWETH(
        IUniswapV2Router02 router,
        address[] calldata path,
        address[] calldata inversePath, // This parameter is now unused in the contract logic
        uint amountIn // This parameter is now unused in the contract logic
    ) public payable onlyOwner returns (uint) {
        IWeth(WETH).deposit{value: msg.value}();
        
        IWeth(WETH).approve(address(router), msg.value);
        uint[] memory amounts1 = router.swapExactTokensForTokens(
            msg.value,
            0,
            path,
            address(this),
            block.timestamp
        );

        address[] memory reversePath = new address[](2);
        reversePath[0] = path[1];
        reversePath[1] = path[0];
        
        IERC20(path[1]).approve(address(router), amounts1[1]);
        uint[] memory amounts2 = router.swapExactTokensForTokens(
            amounts1[1],
            0,
            reversePath,
            address(this),
            block.timestamp
        );

        require(amounts2[1] > msg.value, "No profit");
        
        IWeth(WETH).withdraw(amounts2[1]);
        payable(msg.sender).transfer(amounts2[1]);
        
        return amounts2[1];
    }

    /**
     * @dev Get token balance of contract
     * @param token Token address to check
     * @return Balance of token in contract
     */
    function getTokenBalance(address token) public view returns (uint) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @dev Get ETH balance of contract
     * @return ETH balance in contract
     */
    function getETHBalance() public view returns (uint) {
        return address(this).balance;
    }

    /**
     * @dev Withdraw tokens from contract (owner only)
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function withdrawTokens(address token, uint amount) public onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }

    /**
     * @dev Withdraw ETH from contract (owner only)
     * @param amount Amount of ETH to withdraw
     */
    function withdrawETH(uint amount) public onlyOwner {
        payable(msg.sender).transfer(amount);
    }

    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {}
}

/**
 * @dev Standard ERC20 interface for token operations
 */
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
} 