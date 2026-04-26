import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { RewardPreference, WalletCard } from '../lib/walletCards';
import { CardType } from './CreditCard';

type CardOption = {
  id: string;
  label: string;
  type: CardType;
  network: string;
  rewardStyle: RewardPreference;
  benefits: Record<string, number>;
};

const CARD_OPTIONS: CardOption[] = [
  { id: 'chase-sapphire', label: 'Chase Sapphire Reserve', type: 'chase-sapphire', network: 'visa', rewardStyle: 'travel', benefits: { food: 3, travel: 3, groceries: 1, gas: 1, entertainment: 1, shopping: 1, other: 1 } },
  { id: 'chase-freedom', label: 'Chase Freedom Unlimited', type: 'chase-freedom', network: 'visa', rewardStyle: 'cashback', benefits: { food: 3, travel: 5, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 } },
  { id: 'amex-gold', label: 'Amex Gold Card', type: 'amex-gold', network: 'amex', rewardStyle: 'category', benefits: { food: 4, groceries: 4, travel: 3, gas: 1, entertainment: 1, shopping: 1, other: 1 } },
  { id: 'amex-platinum', label: 'Amex Platinum Card', type: 'amex-platinum', network: 'amex', rewardStyle: 'travel', benefits: { travel: 5, food: 1, groceries: 1, gas: 1, entertainment: 1, shopping: 1, other: 1 } },
  { id: 'capital-one-venture', label: 'Capital One Venture', type: 'capital-one-venture', network: 'visa', rewardStyle: 'travel', benefits: { travel: 2, food: 2, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 } },
  { id: 'capital-one-quicksilver', label: 'Capital One Quicksilver', type: 'capital-one-quicksilver', network: 'visa', rewardStyle: 'cashback', benefits: { food: 2, travel: 2, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 } },
  { id: 'citi-double', label: 'Citi Double Cash', type: 'citi-double', network: 'mastercard', rewardStyle: 'cashback', benefits: { food: 2, travel: 2, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 } },
  { id: 'discover-it', label: 'Discover it Cash Back', type: 'discover', network: 'discover', rewardStyle: 'cashback', benefits: { entertainment: 5, shopping: 5, food: 1, travel: 1, groceries: 1, gas: 1, other: 1 } },
];

const OTHER_BENEFITS = { food: 1, travel: 1, groceries: 1, gas: 1, entertainment: 1, shopping: 1, other: 1 };

function detectNetwork(cardNumber: string): string {
  const first = cardNumber.replace(/\s/g, '')[0];
  if (first === '4') return 'visa';
  if (first === '5') return 'mastercard';
  if (first === '3') return 'amex';
  if (first === '6') return 'discover';
  return 'visa';
}

function getGenericType(network: string): CardType {
  if (network === 'amex') return 'amex-gold';
  if (network === 'mastercard') return 'citi-double';
  if (network === 'discover') return 'discover';
  return 'chase-sapphire';
}

interface AddCardModalProps {
  onClose: () => void;
  onCardAdded: (card: WalletCard) => void;
  userId: string;
}

export function AddCardModal({ onClose, onCardAdded, userId }: AddCardModalProps) {
  const [selectedCardId, setSelectedCardId] = useState(CARD_OPTIONS[0].id);
  const [customCardName, setCustomCardName] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedOption = useMemo(
    () => CARD_OPTIONS.find((option) => option.id === selectedCardId) ?? null,
    [selectedCardId]
  );
  const isOther = selectedCardId === 'other';

  const handleAdd = async () => {
    const digits = cardNumber.replace(/\s/g, '');
    const network = detectNetwork(digits);
    const cardName = isOther ? customCardName.trim() : selectedOption?.label ?? '';

    if (!cardName) return setError('Choose a card or enter the card name');
    if (!cardholder.trim()) return setError('Enter the cardholder name');
    if (digits.length < 4) return setError('Enter a valid card number');
    if (expiry && expiry.length !== 5) return setError('Use MM/YY for the expiry date');

    setError('');
    setLoading(true);

    const newCard: WalletCard = {
      id: `local-${Date.now()}`,
      type: isOther ? getGenericType(network) : selectedOption!.type,
      cardholder: cardholder.trim(),
      last4: digits.slice(-4),
      expires: expiry || undefined,
      card_name: cardName,
      network: isOther ? network : selectedOption!.network,
      rewardStyle: isOther ? 'category' : selectedOption!.rewardStyle,
      benefits: isOther ? OTHER_BENEFITS : selectedOption!.benefits,
    };

    const { data, error: dbError } = await supabase
      .from('user_cards')
      .insert({
        user_id: userId,
        card_name: newCard.card_name,
        network: newCard.network,
        last_four: newCard.last4,
        benefits: newCard.benefits,
      })
      .select('id')
      .single();

    if (dbError) {
      setLoading(false);
      setError(dbError.message);
      return;
    }

    onCardAdded({ ...newCard, id: data?.id ?? newCard.id });
    setLoading(false);
    onClose();
  };

  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <TouchableOpacity className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onClose} activeOpacity={1} />
        <View className="bg-white rounded-t-3xl pb-10">
          <View className="flex-row justify-between items-center px-6 pt-10 pb-4">
            <Text className="text-xl font-bold text-gray-900">Add New Card</Text>
            <TouchableOpacity onPress={onClose} className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center">
              <X size={22} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 8 }}>
            <View className="gap-4">
              <View>
                <Text className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Card</Text>
                <View className="gap-2">
                  {[...CARD_OPTIONS, { id: 'other', label: 'Other', type: 'chase-sapphire' as CardType, network: 'visa', rewardStyle: 'category' as RewardPreference, benefits: OTHER_BENEFITS }].map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => setSelectedCardId(option.id)}
                      className="flex-row items-center justify-between p-3.5 rounded-xl border"
                      style={{ borderColor: selectedCardId === option.id ? '#111827' : '#e5e7eb', backgroundColor: selectedCardId === option.id ? '#f9fafb' : 'white' }}
                      activeOpacity={0.7}
                    >
                      <Text className="font-medium text-gray-800 text-sm">{option.label}</Text>
                      {selectedCardId === option.id && <Check size={16} color="#111827" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {isOther && (
                <View>
                  <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Card Name</Text>
                  <TextInput
                    value={customCardName}
                    onChangeText={setCustomCardName}
                    placeholder="e.g. Wells Fargo Active Cash"
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                  />
                </View>
              )}

              <View>
                <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Cardholder Name</Text>
                <TextInput
                  value={cardholder}
                  onChangeText={setCardholder}
                  placeholder="Name on card"
                  autoCapitalize="words"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Card Number</Text>
                <TextInput
                  value={cardNumber}
                  onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                  placeholder="0000 0000 0000 0000"
                  keyboardType="number-pad"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Expiry Date</Text>
                <TextInput
                  value={expiry}
                  onChangeText={(t) => setExpiry(formatExpiry(t))}
                  placeholder="MM/YY"
                  keyboardType="number-pad"
                  maxLength={5}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                />
              </View>

              {error ? <Text className="text-red-500 text-sm text-center">{error}</Text> : null}

              <TouchableOpacity
                onPress={handleAdd}
                disabled={loading}
                className="w-full py-4 bg-gray-900 rounded-xl mt-1"
              >
                {loading
                  ? <ActivityIndicator color="white" />
                  : <Text className="text-white font-bold text-center">Add Card</Text>
                }
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}



