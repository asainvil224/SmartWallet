import React from 'react';
import { View, Text } from 'react-native';
import { Header } from '../components/Header';
import { CreditCard } from '../components/CreditCard';
import { Wifi } from 'lucide-react-native';

interface MakePaymentProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function MakePayment({ activeTab, onNavigate }: MakePaymentProps) {
  return (
    <View className="flex-1 bg-[#F2F3F5]">
      <Header title="Make a Payment" activeTab={activeTab} onNavigate={onNavigate} />
      <View className="px-6 mt-8 flex-1">
        <CreditCard type="cent" cardholder="Jason" last4="4444" expires="6/2029" />
        <View className="flex-row items-center justify-center gap-2 mt-8">
          <Wifi size={20} color="#9ca3af" style={{ transform: [{ rotate: '90deg' }] }} />
          <Text className="text-sm font-medium text-gray-400">Double tap card to pay</Text>
        </View>
      </View>
    </View>
  );
}
