import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const DEMO_USER_ID = 'demo-user-123';

const PRESETS = [
  { label: '💳 Cash Back — 2% everywhere',     benefits: { food: 2, travel: 2, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 } },
  { label: '✈️  Travel Card — 3x travel',       benefits: { travel: 3, food: 2, groceries: 1, gas: 1, entertainment: 1, shopping: 1, other: 1 } },
  { label: '🍽️  Dining Card — 4x food',          benefits: { food: 4, groceries: 2, travel: 1, gas: 1, entertainment: 1, shopping: 1, other: 1 } },
  { label: '⛽ Gas Card — 3x gas',              benefits: { gas: 3, food: 1, travel: 1, groceries: 1, entertainment: 1, shopping: 1, other: 1 } },
  { label: '🛒 Grocery Card — 5x groceries',    benefits: { groceries: 5, food: 2, travel: 1, gas: 1, entertainment: 1, shopping: 1, other: 1 } },
];

function detectNetwork(cardNumber: string): string {
  const first = cardNumber.replace(/\s/g, '')[0];
  if (first === '4') return 'visa';
  if (first === '5') return 'mastercard';
  if (first === '3') return 'amex';
  return 'visa';
}

interface AddCardModalProps {
  onClose: () => void;
  onCardAdded: () => void;
}

export function AddCardModal({ onClose, onCardAdded }: AddCardModalProps) {
  const [cardName, setCardName]     = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');
  const [preset, setPreset]         = useState<number | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleAdd = async () => {
    if (!cardName.trim())      return setError('Enter a card name');
    if (cardNumber.length < 4) return setError('Enter a valid card number');
    if (preset === null)       return setError('Select a card type');

    setError('');
    setLoading(true);

    const digits = cardNumber.replace(/\s/g, '');
    const lastFour = digits.slice(-4);
    const network = detectNetwork(digits);
    const benefits = PRESETS[preset].benefits;

    const { error: dbError } = await supabase.from('user_cards').insert({
      user_id: DEMO_USER_ID,
      card_name: cardName.trim(),
      network,
      last_four: lastFour,
      benefits,
    });

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
    } else {
      onCardAdded();
      onClose();
    }
  };

  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <TouchableOpacity className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onClose} activeOpacity={1} />
        <View className="bg-white rounded-t-3xl pb-10">
          <View className="flex-row justify-between items-center p-6 pb-4">
            <Text className="text-xl font-bold text-gray-900">Add New Card</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <X size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 8 }}>
            <View className="gap-4">
              {/* Card name */}
              <View>
                <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Card Name</Text>
                <TextInput
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="e.g. Chase Sapphire Reserve"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                />
              </View>

              {/* Card number */}
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

              {/* Expiry */}
              <View>
                <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Expiry Date</Text>
                <TextInput
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="MM/YY"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                />
              </View>

              {/* Card type preset */}
              <View>
                <Text className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Card Type</Text>
                <View className="gap-2">
                  {PRESETS.map((p, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setPreset(i)}
                      className="flex-row items-center justify-between p-3.5 rounded-xl border"
                      style={{ borderColor: preset === i ? '#111827' : '#e5e7eb', backgroundColor: preset === i ? '#f9fafb' : 'white' }}
                      activeOpacity={0.7}
                    >
                      <Text className="font-medium text-gray-800 text-sm">{p.label}</Text>
                      {preset === i && <Check size={16} color="#111827" />}
                    </TouchableOpacity>
                  ))}
                </View>
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
