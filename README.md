# Sepolia AMM Arbitrage Bot

This project is developed to detect and test AMM arbitrage opportunities on the Sepolia testnet. It works exclusively with Uniswap V2.

## 🎯 Features

- **Sepolia Testnet** support
- **Uniswap V2** focused arbitrage
- **Test with your own tokens**
- **Real-time** opportunity detection
- **Safe arbitrage without flash swaps**

## 🪙 Supported Tokens

- **FOGG**: `0x4b39323d4708dDee635ee1be054f3cB9a95D4090`
- **WETH**: `0x6A05167EC0C3f5684525C1bCa2ff25B31950a45e`
- **DAI**: `0xd07A73dBC01e3ca6f60e49Dd079C1C8164efb45d`

## 🏊‍♂️ Pools

- **DAI/WETH**: `0xec0f3838d9545f54d968caEC8a572eEb7C298381`
- **FOGG/WETH**: `0xf46f7851B3e61B5Cc3f6668944c09Df689dB1f73`

## 🔄 Arbitrage Strategies

### 📊 Current Project (Sepolia)
This project uses **cross-pool arbitrage within a single router** strategy:

```
Uniswap V2 Router: 0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3
├── DAI/WETH Pool: 0xec0f3838d9545f54d968caEC8a572eEb7C298381
└── FOGG/WETH Pool: 0xf46f7851B3e61B5Cc3f6668944c09Df689dB1f73

Strategy: DAI → WETH → FOGG (Cross-Pool Arbitrage)
```

**Advantages:**
- ✅ Safe within the same router
- ✅ Low gas costs
- ✅ Leverage liquidity differences
- ✅ Token volatility advantage

### 🏆 Original Project (Polygon)
The original project used **cross-router arbitrage between different DEXes** strategy:

```
5 Different DEXes on Polygon Network:

1. Uniswap V3
   ├── Router: 0xE592427A0AEce92De3Edee1F18E0157C05861564
   └── Quoter: 0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6

2. SushiSwap
   ├── Router: 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506
   └── Strategy: Constant Product AMM

3. QuickSwap
   ├── Router: 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff
   └── Strategy: Uniswap V2 Fork

4. ApeSwap
   ├── Router: 0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607
   └── Strategy: PancakeSwap Fork

5. Merkat
   ├── Router: 0x51aBA405De2b25E5506DeA32A6697F450cEB1a17
   └── Strategy: Custom AMM

Cross-DEX Arbitrage Strategy:
Token A → DEX 1 → Token B → DEX 2 → Token A
```

**Why the Original Project Found Profits:**

1. **Different AMM Systems:**
   - Uniswap V3: Concentrated Liquidity
   - SushiSwap: Constant Product AMM
   - QuickSwap: Uniswap V2 Fork
   - Different price calculation algorithms

2. **Different Liquidity Pools:**
   - Each DEX has its own pools
   - Different liquidity providers
   - Different fee structures (0.3% vs 0.25% vs 0.2%)

3. **Different Slippage Calculations:**
   - Each DEX has its own slippage model
   - Different price impact calculations
   - Different minimum output guarantees

4. **Different Token Lists:**
   - Each DEX supports different tokens
   - Different listing criteria
   - Different trading volumes

### 📈 Profitability Comparison

| Feature | Original Project (Polygon) | Current Project (Sepolia) |
|---------|---------------------------|-------------------------|
| **Strategy** | Cross-DEX Arbitrage | Cross-Pool Arbitrage |
| **Number of Routers** | 5 Different DEXes | 1 Router |
| **AMM System** | 5 Different AMMs | 1 AMM (Uniswap V2) |
| **Price Difference** | High (DEX differences) | Low (Pool differences) |
| **Profit Potential** | High | Medium |
| **Risk** | High | Low |
| **Gas Cost** | High | Low |

### 🎯 Strategy Differences

**Original Project (Cross-DEX):**
```
DEX A: Token A → Token B (Price: X)
DEX B: Token B → Token A (Price: Y)
Profit: |X - Y| - Gas - Fees
```

**Current Project (Cross-Pool):**
```
Pool A: DAI → WETH (Price: X)
Pool B: WETH → FOGG (Price: Y)
Profit: Cross-pool arbitrage advantage
```

## 🚀 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create environment file:**
```bash
cp .env.example .env
```

3. **Add your private key:**
```env
PRIVATE_KEY=your_private_key_here
```

## 📊 Usage

### Simple Test
```bash
npx hardhat run scripts/simpleArbitrage.js --network sepolia
```

### Cross-Arbitrage Test
```bash
npx hardhat run scripts/crossArbitrage.js --network sepolia
```

### Continuous Monitoring
```bash
npx hardhat run scripts/arbitrage.js --network sepolia
```

### Gas Test
```bash
npx hardhat run scripts/gas.js --network sepolia
```

## 🔄 Arbitrage Paths

The bot tests the following arbitrage paths:

1. **FOGG → WETH → DAI → FOGG**
2. **DAI → WETH → FOGG → DAI**
3. **WETH → FOGG → DAI → WETH**

### 🎯 Cross-Pool Arbitrage Paths

**Most Profitable Path:**
```
DAI → WETH → FOGG (Cross-Pool)
├── Step 1: DAI → WETH (DAI/WETH Pool)
└── Step 2: WETH → FOGG (FOGG/WETH Pool)
```

**Advantages:**
- ✅ Leverage liquidity differences
- ✅ Token volatility advantage
- ✅ Timing advantage
- ✅ Slippage differences

## ⚙️ Configuration

### Test Amounts
- **Small**: 1 ETH
- **Medium**: 5 ETH
- **Large**: 10 ETH

### Monitoring Frequency
- Check every 30 seconds

## 🛡️ Security

- No flash swaps used
- Works only on testnet
- Test with your own tokens
- Gas costs are calculated

## 📈 Profitability Calculation

The bot calculates the following factors:
- **Swap costs**
- **Gas fees**
- **Slippage**
- **Minimum profit margin**

### 🎯 Cross-Pool Profitability Factors

1. **Liquidity Differences:**
   - DAI/WETH Pool: High liquidity
   - FOGG/WETH Pool: Low liquidity
   - Price impact differences

2. **Token Volatility:**
   - DAI: Stablecoin (low volatility)
   - WETH: Major token (medium volatility)
   - FOGG: Meme token (high volatility)

3. **Timing Advantage:**
   - Step 1: Instant price
   - Step 2: Different instant price
   - Two different time periods

## 🔧 Development

### Adding New Tokens
Edit the `data/tokens.js` file:
```javascript
const NEW_TOKEN = "0x...";
const NEW_POOL = "0x...";
```

### Adding New Arbitrage Path
```javascript
const newPath = [TOKEN1, TOKEN2, TOKEN3, TOKEN1];
```

## 📝 Logs

The bot logs the following information:
- Token addresses
- Pool addresses
- Arbitrage opportunities
- Profit/loss calculations
- Gas costs

## ⚠️ Warnings

- This bot should only be used for **testing purposes**
- Do not test with **real money**
- Ensure sufficient liquidity in pools
- Consider gas costs

## 🆘 Troubleshooting

### Connection Issues
```bash
# Test network connection
npx hardhat console --network sepolia
```

### Token Issues
```bash
# Check token balances
npx hardhat run scripts/refreshTokensData.js --network sepolia
```

## 📞 Support

You can open issues or send PRs for your problems.

---

**Note**: This project is for educational purposes. Additional security measures should be taken for real arbitrage operations.