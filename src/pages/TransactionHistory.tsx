import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { RefreshCw, Check } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { getRewardRate, WALLET_CARDS, WalletTransaction } from '../lib/walletCards';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Transaction = WalletTransaction;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function calcRewards(amount: number, category: string, cardName: string | null) {
  const card = WALLET_CARDS.find((c) => c.card_name === cardName);
  const rate = card ? getRewardRate(card, category) : 1;
  const dollars = ((amount * rate) / 100).toFixed(2);
  return { dollars, rate };
}

interface TransactionHistoryProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  userId: string;
  localTransactions: WalletTransaction[];
}

export function TransactionHistory({ activeTab, onNavigate, userId, localTransactions }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, currency, merchant_name, merchant_category, card_name, status, created_at, stripe_payment_intent_id, used_recommended')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const remoteTransactions = data as Transaction[];
      const remoteIds = new Set(remoteTransactions.map((tx) => tx.stripe_payment_intent_id));
      const merged = [
        ...localTransactions.filter((tx) => !remoteIds.has(tx.stripe_payment_intent_id)),
        ...remoteTransactions,
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactions(merged);
    } else {
      setTransactions(localTransactions);
    }

    setLoading(false);
  }, [localTransactions, userId]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

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
          <TouchableOpacity onPress={fetchTransactions} className="flex-row items-center gap-2 bg-[#4A4A4A] px-4 py-2 rounded-full">
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
            const { dollars, rate } = calcRewards(tx.amount, tx.merchant_category, tx.card_name);

            return (
              <TouchableOpacity key={tx.id} onPress={() => toggleExpand(tx.id)} className="bg-white rounded-2xl p-4 shadow-sm" activeOpacity={0.8}>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-4 flex-1 pr-3">
                    <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: '#E8F8EE' }}>
                      <Check size={24} strokeWidth={3} color="#39FF14" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 text-lg capitalize">{tx.merchant_name}</Text>
                      <Text className="text-xs text-gray-400 mt-0.5 font-medium">{formatDate(tx.created_at)}</Text>
                      <Text className="text-xs font-bold mt-1 capitalize" style={{ color: '#39FF14' }}>{tx.status}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-gray-900 text-lg">${tx.amount.toFixed(2)}</Text>
                    <Text className="text-xs text-gray-400 font-medium mt-0.5">{tx.currency?.toUpperCase()}</Text>
                  </View>
                </View>

                {expandedId === tx.id && (
                  <View className="border-t border-gray-100 pt-4 mt-4 gap-3">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 font-medium text-sm">Merchant</Text>
                      <Text className="font-bold text-gray-900 text-sm capitalize">{tx.merchant_category}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 font-medium text-sm">Card Used</Text>
                      <Text className="font-bold text-gray-900 text-sm">{tx.card_name ?? 'Unknown card'}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 font-medium text-sm">Recommendation</Text>
                      <Text className="text-sm font-medium" style={{ color: tx.used_recommended ? '#39FF14' : '#9ca3af' }}>
                        {tx.used_recommended ? 'Followed' : 'Manual pick'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-500 font-medium text-sm">Rewards Earned</Text>
                      <View className="flex-row items-center gap-1">
                        <Text className="font-bold text-sm" style={{ color: '#39FF14' }}>${dollars}</Text>
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

