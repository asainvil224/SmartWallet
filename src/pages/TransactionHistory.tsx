import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Header } from '../components/Header';
import { RefreshCw, Check } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const transactions = [
  { id: '1', amount: 74.98, date: 'Oct 12, 2025 at 11:50 AM', status: 'Succeeded', card: 'CENT •••• 4444', rewards: '$1.12' },
  { id: '2', amount: 9.10, date: 'Oct 12, 2025 at 11:42 AM', status: 'Succeeded', card: 'CENT •••• 4444', rewards: '$0.14' },
  { id: '3', amount: 31.78, date: 'Oct 12, 2025 at 11:35 AM', status: 'Succeeded', card: 'CENT •••• 4444', rewards: '$0.48' },
  { id: '4', amount: 65.72, date: 'Oct 12, 2025 at 11:32 AM', status: 'Succeeded', card: 'CENT •••• 4444', rewards: '$0.99' },
];

interface TransactionHistoryProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function TransactionHistory({ activeTab, onNavigate }: TransactionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View className="flex-1 bg-[#F2F3F5]">
      <Header title="Transaction History" activeTab={activeTab} onNavigate={onNavigate} />
      <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-bold text-gray-900">Transaction History</Text>
          <TouchableOpacity className="flex-row items-center gap-2 bg-[#4A4A4A] px-4 py-2 rounded-full">
            <RefreshCw size={14} color="white" />
            <Text className="text-white text-sm font-medium">Refresh</Text>
          </TouchableOpacity>
        </View>

        <View className="gap-4">
          {transactions.map((tx) => (
            <TouchableOpacity
              key={tx.id}
              onPress={() => toggleExpand(tx.id)}
              className="bg-white rounded-2xl p-4 shadow-sm"
              activeOpacity={0.8}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: '#E8F8EE' }}>
                    <Check size={24} strokeWidth={3} color="#39FF14" />
                  </View>
                  <View>
                    <Text className="font-bold text-gray-900 text-lg">Payment</Text>
                    <Text className="text-xs text-gray-400 mt-0.5 font-medium">{tx.date}</Text>
                    <Text className="text-xs font-bold mt-1" style={{ color: '#39FF14' }}>{tx.status}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-gray-900 text-lg">${tx.amount.toFixed(2)}</Text>
                  <Text className="text-xs text-gray-400 font-medium mt-0.5">USD</Text>
                </View>
              </View>

              {expandedId === tx.id && (
                <View className="border-t border-gray-100 pt-4 mt-4 gap-3">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 font-medium text-sm">Transaction ID</Text>
                    <Text className="font-bold text-gray-900 text-sm">TXN-{tx.id}982374</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 font-medium text-sm">Card Used</Text>
                    <Text className="font-bold text-gray-900 text-sm">{tx.card}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500 font-medium text-sm">Rewards Earned</Text>
                    <View className="flex-row items-center gap-1">
                      <Text className="font-bold text-sm" style={{ color: '#39FF14' }}>{tx.rewards}</Text>
                      <Text className="text-gray-400 font-medium text-xs">(1.5% cashback)</Text>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
