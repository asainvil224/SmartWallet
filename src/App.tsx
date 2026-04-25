import React, { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MakePayment } from './pages/MakePayment';
import { MyWallet } from './pages/MyWallet';
import { TransactionHistory } from './pages/TransactionHistory';
import { MyProfile } from './pages/MyProfile';

export function App() {
  const [activeTab, setActiveTab] = useState('payment');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNavigate = (tab: string) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'payment':
        return <MakePayment activeTab={activeTab} onNavigate={handleNavigate} />;
      case 'wallet':
        return <MyWallet activeTab={activeTab} onNavigate={handleNavigate} />;
      case 'history':
        return <TransactionHistory activeTab={activeTab} onNavigate={handleNavigate} />;
      case 'profile':
        return <MyProfile activeTab={activeTab} onNavigate={handleNavigate} />;
      default:
        return <MakePayment activeTab={activeTab} onNavigate={handleNavigate} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#F2F3F5]">
        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          {renderTab()}
        </Animated.View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
