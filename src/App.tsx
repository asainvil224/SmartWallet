import React, { useState } from 'react';
import { MakePayment } from './pages/MakePayment';
import { MyWallet } from './pages/MyWallet';
import { TransactionHistory } from './pages/TransactionHistory';
import { MyProfile } from './pages/MyProfile';
import { motion, AnimatePresence } from 'framer-motion';
export function App() {
  const [activeTab, setActiveTab] = useState('payment');
  const renderTab = () => {
    switch (activeTab) {
      case 'payment':
        return (
          <MakePayment
            key="payment"
            activeTab={activeTab}
            onNavigate={setActiveTab} />);


      case 'wallet':
        return (
          <MyWallet
            key="wallet"
            activeTab={activeTab}
            onNavigate={setActiveTab} />);


      case 'history':
        return (
          <TransactionHistory
            key="history"
            activeTab={activeTab}
            onNavigate={setActiveTab} />);


      case 'profile':
        return (
          <MyProfile
            key="profile"
            activeTab={activeTab}
            onNavigate={setActiveTab} />);


      default:
        return (
          <MakePayment
            key="payment"
            activeTab={activeTab}
            onNavigate={setActiveTab} />);


    }
  };
  return (
    <div className="flex w-full min-h-screen justify-center items-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-[390px] h-[844px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border-[8px] border-gray-900">
        {/* Dynamic Island / Notch placeholder */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-900 rounded-b-3xl z-50"></div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}
            transition={{
              duration: 0.2
            }}
            className="h-full w-full">
            
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>);

}