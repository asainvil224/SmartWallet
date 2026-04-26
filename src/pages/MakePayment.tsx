import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { CreditCard } from '../components/CreditCard';
import { Check, Wifi, X } from 'lucide-react-native';
import { PaymentResult, useStripePayment } from '../hooks/useStripePayment';
import { supabase } from '../lib/supabase';
import { getRewardRate, pickBestWalletCard, RewardPreference, WalletCard, WalletTransaction } from '../lib/walletCards';

type Recommendation = PaymentResult & {
  merchantName: string;
  amount: number;
};

interface MakePaymentProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  walletCards: WalletCard[];
  rewardPreference: RewardPreference;
  userId: string;
  onTransactionAdded: (transaction: WalletTransaction) => void;
}

export function MakePayment({ activeTab, onNavigate, walletCards, rewardPreference, userId, onTransactionAdded }: MakePaymentProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recommendedCardId, setRecommendedCardId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [paymentIntentId, setIntentId] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const { initiateSimulated, confirmAndLog, loading, error } = useStripePayment();

  const selectedCard = walletCards.find((card) => card.id === selectedCardId) ?? null;
  const recommendedCard = walletCards.find((card) => card.id === recommendedCardId) ?? null;
  const category = recommendation?.merchantCategory ?? 'other';
  const savings = recommendation && selectedCard
    ? calculateSavings(recommendation.amount, selectedCard, category)
    : '$0.00';

  const handleCardTap = async () => {
    setSuccess(false);
    setPaymentError('');
    setRecommendation(null);
    setRecommendedCardId(null);
    setSelectedCardId(null);
    setModalVisible(true);

    try {
      const result = await initiateSimulated(userId, walletCards);
      const bestCard = pickBestWalletCard(walletCards, result.merchantCategory, rewardPreference) ?? result.recommendedCard;
      setRecommendation(result);
      setRecommendedCardId(bestCard?.id ?? null);
      setSelectedCardId(bestCard?.id ?? null);
      setIntentId(result.paymentIntentId);
    } catch (paymentStartError) {
      const message = paymentStartError instanceof Error ? paymentStartError.message : 'Could not start payment.';
      setPaymentError(message);
      setRecommendation(null);
    }
  };

  const handleConfirm = async () => {
    if (!recommendation || !selectedCard) return;

    setPaymentError('');

    try {
      await confirmAndLog(paymentIntentId, selectedCard.id, userId);

      const transaction = {
        id: `local-${Date.now()}`,
        amount: recommendation.amount,
        currency: 'usd',
        merchant_name: recommendation.merchantName,
        merchant_category: recommendation.merchantCategory,
        card_name: selectedCard.card_name,
        status: 'succeeded',
        created_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntentId,
        used_recommended: selectedCard.id === recommendedCardId,
      };

      const { data, error: dbError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: transaction.amount,
          currency: transaction.currency,
          merchant_name: transaction.merchant_name,
          merchant_category: transaction.merchant_category,
          card_name: transaction.card_name,
          status: transaction.status,
          stripe_payment_intent_id: transaction.stripe_payment_intent_id,
          used_recommended: transaction.used_recommended,
        })
        .select('id, created_at')
        .single();

      if (dbError) throw dbError;

      onTransactionAdded({
        ...transaction,
        id: data?.id ?? transaction.id,
        created_at: data?.created_at ?? transaction.created_at,
      });
      setSuccess(true);
    } catch (paymentConfirmError) {
      const message = paymentConfirmError instanceof Error ? paymentConfirmError.message : 'Payment could not be saved.';
      setPaymentError(message);
      setSuccess(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setRecommendation(null);
    setRecommendedCardId(null);
    setSelectedCardId(null);
    setPaymentError('');
    setSuccess(false);
  };

  return (
    <View className="flex-1 bg-[#F2F3F5]">
      <Header title="Make a Payment" activeTab={activeTab} onNavigate={onNavigate} />

      <View className="px-6 mt-8 flex-1">
        <TouchableOpacity onPress={handleCardTap} activeOpacity={0.9}>
          <CreditCard type="cent" cardholder="Jason" last4="4444" expires="6/2029" />
        </TouchableOpacity>
        <View className="flex-row items-center justify-center gap-2 mt-8">
          <Wifi size={20} color="#9ca3af" style={{ transform: [{ rotate: '90deg' }] }} />
          <Text className="text-sm font-medium text-gray-400">Tap card to pay</Text>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={handleClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} activeOpacity={1} />
          <View className="bg-white rounded-t-3xl p-6 pb-10 max-h-[78%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                {success ? 'Payment Complete' : 'Best Card to Use'}
              </Text>
              <TouchableOpacity onPress={handleClose} className="p-2 bg-gray-100 rounded-full">
                <X size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {loading && !recommendation && (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#111827" />
                <Text className="text-gray-400 mt-3 font-medium">Detecting merchant...</Text>
              </View>
            )}

            {!loading && !recommendation && !success && (
              <View className="items-center py-8">
                <Text className="text-red-500 font-medium text-center mb-2">
                  {paymentError || error || 'Could not start payment.'}
                </Text>
                <Text className="text-gray-400 text-xs text-center">
                  Start the backend with npm run backend, then try again.
                </Text>
              </View>
            )}

            {success && recommendation && selectedCard && (
              <View className="items-center py-4">
                <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#E8F8EE' }}>
                  <Check size={30} color="#111827" />
                </View>
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  ${recommendation.amount.toFixed(2)} paid
                </Text>
                <Text className="text-gray-500 mb-1">{recommendation.merchantName}</Text>
                <Text className="text-sm font-bold" style={{ color: '#39FF14' }}>
                  {savings} saved with {selectedCard.card_name}
                </Text>
              </View>
            )}

            {!success && recommendation && (
              <ScrollView className="-mx-1 px-1" contentContainerStyle={{ gap: 16, paddingBottom: 4 }}>
                <View className="bg-gray-50 rounded-2xl p-4">
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Merchant</Text>
                  <Text className="font-bold text-gray-900 text-base">{recommendation.merchantName}</Text>
                  <Text className="text-sm text-gray-400 capitalize">
                    {recommendation.merchantCategory} - ${recommendation.amount.toFixed(2)}
                  </Text>
                </View>

                {recommendedCard && (
                  <View className="bg-gray-50 rounded-2xl p-4">
                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      SmartWallet Recommends
                    </Text>
                    <CardChoice
                      card={recommendedCard}
                      category={category}
                      selected={selectedCardId === recommendedCard.id}
                      recommended
                      onPress={() => setSelectedCardId(recommendedCard.id)}
                    />
                  </View>
                )}

                <View className="bg-gray-50 rounded-2xl p-4">
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Choose Another Card</Text>
                  <View className="gap-2">
                    {walletCards.map((card) => (
                      <CardChoice
                        key={card.id}
                        card={card}
                        category={category}
                        selected={selectedCardId === card.id}
                        recommended={card.id === recommendedCardId}
                        onPress={() => setSelectedCardId(card.id)}
                      />
                    ))}
                  </View>
                </View>

                {(paymentError || error) && <Text className="text-red-500 text-sm text-center">{paymentError || error}</Text>}

                <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={loading || !selectedCard}
                  className={`w-full py-4 rounded-xl ${loading ? 'bg-gray-500' : 'bg-gray-900'}`}
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-center">Confirm Payment</Text>}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CardChoice({ card, category, selected, recommended, onPress }: {
  card: WalletCard;
  category: string;
  selected: boolean;
  recommended?: boolean;
  onPress: () => void;
}) {
  const rate = getRewardRate(card, category);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row justify-between items-center rounded-xl border p-3"
      style={{ borderColor: selected ? '#111827' : '#e5e7eb', backgroundColor: selected ? '#ffffff' : '#f9fafb' }}
      activeOpacity={0.75}
    >
      <View className="flex-1 pr-3">
        <Text className="font-bold text-gray-900">{card.card_name}</Text>
        <Text className="text-sm text-gray-400">**** {card.last4}</Text>
        {recommended && <Text className="text-[10px] font-bold text-gray-500 uppercase mt-1">Recommended</Text>}
      </View>
      <View className="items-end">
        <Text className="font-bold text-lg" style={{ color: '#39FF14' }}>{rate}% back</Text>
        {selected && <Text className="text-xs text-gray-400">Selected</Text>}
      </View>
    </TouchableOpacity>
  );
}

function calculateSavings(amount: number, card: WalletCard, category: string) {
  const savings = (amount * (getRewardRate(card, category) - 1)) / 100;
  return savings > 0 ? `$${savings.toFixed(2)}` : '$0.00';
}
