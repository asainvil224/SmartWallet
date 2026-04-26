import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Header } from '../components/Header';
import { CreditCard } from '../components/CreditCard';
import { Wifi, X } from 'lucide-react-native';
import { useStripePayment } from '../hooks/useStripePayment';

const DEMO_USER_ID = 'demo-user-123';

interface MakePaymentProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function MakePayment({ activeTab, onNavigate }: MakePaymentProps) {
  const [modalVisible, setModalVisible]     = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [paymentIntentId, setIntentId]      = useState('');
  const [success, setSuccess]               = useState(false);

  const { initiateSimulated, confirmAndLog, loading, error } = useStripePayment();

  const handleCardTap = async () => {
    setSuccess(false);
    setRecommendation(null);
    setModalVisible(true);
    const result = await initiateSimulated(DEMO_USER_ID);
    setRecommendation(result);
    setIntentId(result.paymentIntentId);
  };

  const handleConfirm = async () => {
    if (!recommendation?.recommendedCard) return;
    await confirmAndLog(paymentIntentId, recommendation.recommendedCard.id, DEMO_USER_ID);
    setSuccess(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setRecommendation(null);
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

      {/* Payment modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={handleClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} activeOpacity={1} />
          <View className="bg-white rounded-t-3xl p-6 pb-10">

            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                {success ? 'Payment Complete' : 'Best Card to Use'}
              </Text>
              <TouchableOpacity onPress={handleClose} className="p-2 bg-gray-100 rounded-full">
                <X size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {/* Loading */}
            {loading && !recommendation && (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#111827" />
                <Text className="text-gray-400 mt-3 font-medium">Detecting merchant...</Text>
              </View>
            )}

            {/* Error (no recommendation came back) */}
            {!loading && !recommendation && !success && (
              <View className="items-center py-8">
                <Text className="text-red-500 font-medium text-center mb-2">
                  {error || 'Could not reach backend. Is the server running?'}
                </Text>
                <Text className="text-gray-400 text-xs text-center">
                  Make sure node server.js is running on port 3001
                </Text>
              </View>
            )}

            {/* Success */}
            {success && recommendation && (
              <View className="items-center py-4">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: '#E8F8EE' }}
                >
                  <Text style={{ fontSize: 30 }}>✓</Text>
                </View>
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  ${recommendation.amount?.toFixed(2)} paid
                </Text>
                <Text className="text-gray-500 mb-1">
                  {recommendation.merchantName}
                </Text>
                <Text className="text-sm font-bold" style={{ color: '#39FF14' }}>
                  {recommendation.savings} saved with {recommendation.recommendedCard?.card_name}
                </Text>
              </View>
            )}

            {/* Recommendation */}
            {!success && recommendation && (
              <View className="gap-4">
                {/* Merchant info */}
                <View className="bg-gray-50 rounded-2xl p-4">
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Merchant
                  </Text>
                  <Text className="font-bold text-gray-900 text-base">
                    {recommendation.merchantName}
                  </Text>
                  <Text className="text-sm text-gray-400 capitalize">
                    {recommendation.merchantCategory} · ${recommendation.amount?.toFixed(2)}
                  </Text>
                </View>

                {/* Recommended card */}
                {recommendation.recommendedCard && (
                  <View className="bg-gray-50 rounded-2xl p-4">
                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      SmartWallet Recommends
                    </Text>
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="font-bold text-gray-900">
                          {recommendation.recommendedCard.card_name}
                        </Text>
                        <Text className="text-sm text-gray-400">
                          •••• {recommendation.recommendedCard.last_four}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-lg" style={{ color: '#39FF14' }}>
                          {recommendation.recommendedCard.benefits?.[recommendation.merchantCategory] ?? 1}% back
                        </Text>
                        <Text className="text-xs text-gray-400">Save {recommendation.savings}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {error && (
                  <Text className="text-red-500 text-sm text-center">{error}</Text>
                )}

                <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 rounded-xl"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-center">Confirm Payment</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
