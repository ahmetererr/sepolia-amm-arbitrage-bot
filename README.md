# AMM Arbitrageur Project

## 📋 Project Summary

This project is a smart contract and script collection developed to test cross-token arbitrage operations on Uniswap V2. The project is designed to test arbitrage opportunities between DAI, WETH, and FOGG tokens.

## 🎯 Project Objectives

- **AMM Arbitrage Tests:** Test cross-token arbitrage operations on Uniswap V2 router
- **Smart Contract Development:** Develop custom smart contracts for arbitrage operations
- **Testnet Experience:** Perform real transactions on Sepolia testnet
- **Arbitrage Logic Learning:** Understand the difference between token swap and real arbitrage

## 🏗️ Project Structure

```
amm-arbitrageur-1/
├── contracts/
│   ├── interfaces/
│   │   ├── IUniswapV2Router02.sol
│   │   └── IWeth.sol
│   └── Zap2.sol
├── config/
│   ├── blockchain.js
│   ├── config.json
│   └── dexes.json
├── scripts/
│   └── crossArbitrage.js
├── utils/
│   └── swapsUtilities.js
└── README.md
```

## 🔧 Technologies

- **Blockchain:** Ethereum Sepolia Testnet
- **Smart Contract:** Solidity 0.8.9+
- **Framework:** Hardhat
- **Library:** Ethers.js
- **DEX:** Uniswap V2
- **Tokens:** DAI, WETH, FOGG

## 📦 Installation

### Requirements
- Node.js 16+
- npm or yarn
- MetaMask or similar wallet

### Installation Steps
```bash
# Clone the project
git clone <repository-url>
cd amm-arbitrageur-1

# Install dependencies
npm install

# Install Hardhat
npm install --save-dev hardhat

# Create environment file
cp .env.example .env
# Add your private key to .env file
```

## 🚀 Usage

### 1. Blockchain Connection
```bash
# Connect to Sepolia testnet
npx hardhat run scripts/crossArbitrage.js --network sepolia
```

### 2. Arbitrage Test
```bash
# Run cross-pool arbitrage test
npx hardhat run scripts/crossArbitrage.js --network sepolia
```

## 📊 Project Components

### Smart Contracts

#### Zap2.sol
Main arbitrage contract. Contains the following functions:

- **arbitrageDaiToFogg():** DAI → WETH → FOGG conversion
- **arbitrageFoggToDai():** FOGG → WETH → DAI conversion
- **arbitrageV2ToV2():** 2-token arbitrage (for comparison)
- **arbitrageWithWETH():** WETH-based arbitrage

#### Interfaces
- **IUniswapV2Router02.sol:** Uniswap V2 router interface
- **IWeth.sol:** WETH token interface

### Scripts

#### crossArbitrage.js
Cross-pool arbitrage test script:
- Tests DAI → WETH → FOGG path
- Performs price calculations
- Analyzes ROI

## 💡 Lessons Learned

### 1. Arbitrage vs Token Swap
**Wrong Understanding:**
```javascript
// DAI → WETH → FOGG (token exchange)
// This is not arbitrage, just a swap!
```

**Correct Understanding:**
```javascript
// Buy and sell the same token at different prices
// Pool A: 1 DAI = 2 WETH
// Pool B: 1 DAI = 2.1 WETH
// Arbitrage: Buy from A, sell to B
```

### 2. Pool Structure
- **Single DEX arbitrage is difficult:** No price differences for same token
- **Multiple DEXs required:** Price differences occur between different DEXs

### 3. Token Characteristics
- **DAI:** Stablecoin (stable value)
- **FOGG:** Meme token (low value)
- **WETH:** Bridge token (intermediate token)

## 🎯 Test Results

### Successful Operations
- ✅ Contract deployment
- ✅ Token transfer operations
- ✅ Cross-pool swap operations
- ✅ Smart contract functions

### Learned Facts
- ❌ This project is not suitable for real arbitrage
- ✅ Token swap functions work correctly
- 📚 Valuable learning experience

## 🔮 Future Improvements

### Required for Real Arbitrage
1. **Multi-DEX Integration**
   - Uniswap V2
   - SushiSwap
   - PancakeSwap

2. **Price Monitoring System**
   - Continuous price tracking
   - Data fetching from different pools
   - Price difference calculation

3. **Risk Management**
   - Slippage control
   - Gas cost calculation
   - Minimum profit control

4. **Flash Loan Support**
   - Aave or similar protocols
   - Gas optimization
   - MEV protection

## 📝 Notes

### Testnet Information
- **Network:** Sepolia Testnet
- **Chain ID:** 11155111
- **RPC URL:** https://rpc.sepolia.org

### Token Addresses (Sepolia)
- **WETH:** 0x6A05167EC0C3f5684525C1bCa2ff25B31950a45e
- **DAI:** 0xd07A73dBC01e3ca6f60e49Dd079C1C8164efb45d
- **FOGG:** 0x4b39323d4708dDee635ee1be054f3cB9a95D4090
- **Router:** 0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**AMM Arbitrageur Project Team**

---

*This project is developed for educational purposes. More advanced systems are required for real arbitrage.*