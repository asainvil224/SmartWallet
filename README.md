# 💳 SmartWallet

## Overview
SmartWallet is a mobile-first intelligent wallet that automatically selects the best credit card for every purchase. Instead of manually deciding which card to use, SmartWallet intercepts the transaction, identifies the merchant category, and routes the payment to whichever card earns the most rewards in real time.

---

## 🚨 The Problem
Most people own multiple credit cards but rarely use them optimally. They forget which card gives the best rewards at restaurants, miss cashback opportunities at grocery stores, and leave points on the table every day. Manually tracking reward categories across Amex, Chase, Discover, and Capital One is tedious and error-prone.

---

## 💡 Our Solution
SmartWallet acts as an intelligence layer above your wallet. Users make purchases with a single SmartWallet card. Our optimization engine reads the merchant’s category code from Stripe, evaluates all cards in your wallet against their reward rules, and automatically routes the transaction to the best card before payment is confirmed.

---

## ✨ Key Features
- 🔄 Automatic card optimization — selects the best card in real time for every transaction  
- 💳 Stripe-powered payments — secure card storage and payment routing via Stripe  
- 🏷️ MCC-based categorization — merchant categories sourced from Stripe transaction data  
- 📊 Reward tracking — logs card used, category, and rewards earned per transaction  
- 📜 Transaction history — full breakdown of purchases and rewards  
- 🏦 Multi-issuer support — supports Amex, Chase, Discover, and Capital One  

---

## 🛠 Tech Stack

### Frontend
- React Native  
- Expo  
- TypeScript  
- NativeWind  

### Backend
- Node.js  
- Express.js  

### Database
- PostgreSQL  

### Payments
- Stripe  
