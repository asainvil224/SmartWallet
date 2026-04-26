import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { RefreshCw, Check } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEMO_USER_ID = 'demo-user-123';

type Transaction = {
  id: string;
  amount: number;
  currency: string;
  merchant_name: string;
  merchant_category: string;
  status: string;
  created_at: string;
  stripe_payment_intent_id: string;
  used_recommended: boolean;
  card: {
    card_name: string;
    last_four: string;
    network: string;
    benefits: Record<string, number>;
  } | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function calcRewards(amount: number, category: string, benefits: Record<string, number> | undefined) {
  const rate = benefits?.[category] ?? 1;
  return { dollars: ((amount * rate) / 100).toFixed(2), rate };
}

interface TransactionHistoryProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function TransactionHistory({ activeTab, onNavigate }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [expandedId, setExpandedId]     = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id, amount, currency, merchant_name, merchant_category,
        status, created_at, stripe_payment_intent_id, used_recommended,
        card:card_id ( card_name, last_four, network, benefits )
      `)
      .eq('user_id', DEMO_USER_ID)
      .order('created_at', { ascending: false });

    if (!error && data) setTransactions(data as unknown as Transaction[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Re-fetch whenever the history tab becomes active
  useEffect(() => {
    if (activeTab === 'history') fetchTransactions();
  }, [activeTab, fetchTransactions]);

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
          <TouchableOpacity
            onPress={fetchTransactions}
            className="flex-row items-center gap-2 bg-[#4A4A4A] px-4 py-2 rounded-full"
          >
            <RefreshCw size={14} color="white" />
            <Text className="text-white text-sm font-medium">Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#111827" />
          </View>
        )}

        {!loading && transactions.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-gray-400 font-medium">No transactions yet</Text>
            <Text className="text-gray-300 text-sm mt-1">Tap your card to make a payment</Text>
          </View>
        )}

        <View className="gap-4">
          {transactions.map((tx) => {
            const { dollars, rate } = calcRewards(tx.amount, tx.merchant_category, tx.card?.benefits);
            const cardLabel = tx.card
              ? `${tx.card.network?.toUpperCase()} •••• ${tx.card.last_four}`
              : 'Unknown card';

            return (
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
                      <Text className="font-bold text-gray-900 text-lg capitalize">
                        {tx.merchant_name}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-0.5 font-medium">
                        {formatDate(tx.created_at)}
                      </Text>
                      <Text className="text-xs font-bold mt-1 capitalize" style={{ color: '#39FF14' }}>
                        {tx.status}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-gray-900 text-lg">${tx.amount.toFixed(2)}</Text>
                    <Text className="text-xs text-gray-400 font-medium mt-0.5">
                      {tx.currency?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {expandedId === tx.id && (
                  <View className="border-t border-gray-100 pt-4 mt-4 gap-3">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 font-medium text-sm">Merchant</Text>
                      <Text className="font-bold text-gray-900 text-sm capitalize">
                        {tx.merchant_category}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 font-medium text-sm">Card Used</Text>
                      <Text className="font-bold text-gray-900 text-sm">{cardLabel}</Text>
                    </View>
                    {tx.card && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 font-medium text-sm">{tx.card.card_name}</Text>
                        <Text className="text-gray-400 text-sm font-medium">
                          {tx.used_recommended ? '✓ Recommended' : 'Manual pick'}
                        </Text>
                      </View>
                    )}
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-500 font-medium text-sm">Rewards Earned</Text>
                      <View className="flex-row items-center gap-1">
                        <Text className="font-bold text-sm" style={{ color: '#39FF14' }}>
                          ${dollars}
                        </Text>
                        <Text className="text-gray-400 font-medium text-xs">({rate}% cashback)</Text>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
