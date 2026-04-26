import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Modal, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Header } from '../components/Header';
import { CreditCard } from '../components/CreditCard';
import { Plus, Pencil, Trash2, X, ChevronLeft, CreditCard as CardIcon, Calendar, User } from 'lucide-react-native';
import { AddCardModal } from '../components/AddCardModal';

interface MyWalletProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

type CardType = 'cent' | 'mastercard' | 'blue';

interface CardData {
  id: string;
  type: CardType;
  cardholder: string;
  last4: string;
  expires?: string;
}

const initialCards: CardData[] = [
  { id: '1', type: 'mastercard', cardholder: 'Jason', last4: '4444' },
  { id: '2', type: 'blue', cardholder: 'Jason', last4: '4444' },
  { id: '3', type: 'smartwallet', cardholder: 'Jason', last4: '4444', expires: '6/2029' },
];

function getCardLabel(type: CardType) {
  if (type === 'cent') return 'SmartWallet';
  if (type === 'mastercard') return 'Mastercard Standard';
  return 'Visa Platinum';
}

export function MyWallet({ activeTab, onNavigate }: MyWalletProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const detailOpacity = useRef(new Animated.Value(0)).current;

  const expandedCard = cards.find((c) => c.id === expandedCardId) ?? null;

  const showDetail = (id: string) => {
    setExpandedCardId(id);
    Animated.timing(detailOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const hideDetail = () => {
    Animated.timing(detailOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() =>
      setExpandedCardId(null)
    );
  };

  const handleCardClick = (clickedId: string, index: number) => {
    if (index === 0) {
      showDetail(clickedId);
    } else {
      setCards((prev) => {
        const next = [...prev];
        const [card] = next.splice(index, 1);
        next.unshift(card);
        return next;
      });
    }
  };

  const handleDeleteCard = () => {
    if (!expandedCardId) return;
    setCards((prev) => prev.filter((c) => c.id !== expandedCardId));
    hideDetail();
  };

  const addButton = (
    <TouchableOpacity
      onPress={() => setIsModalOpen(true)}
      className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm"
    >
      <Plus size={18} color="#111827" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#F2F3F5]">
      {/* Card detail overlay */}
      {expandedCard && (
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: detailOpacity, zIndex: 40, backgroundColor: '#F2F3F5' }]}>
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
            <TouchableOpacity onPress={hideDetail} className="w-8 h-8 bg-white rounded-full shadow-sm items-center justify-center">
              <ChevronLeft size={18} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Card Details</Text>
            <View className="w-8" />
          </View>

          <View className="px-6 mt-2">
            <CreditCard
              type={expandedCard.type}
              cardholder={expandedCard.cardholder}
              last4={expandedCard.last4}
              expires={expandedCard.expires}
            />
          </View>

          <ScrollView className="flex-1 px-6 mt-8" contentContainerStyle={{ paddingBottom: 32 }}>
            <View className="bg-white rounded-2xl p-5 shadow-sm gap-4">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 bg-gray-100 rounded-xl items-center justify-center">
                  <CardIcon size={16} color="#6b7280" />
                </View>
                <View>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Card Type</Text>
                  <Text className="font-medium text-gray-900 text-sm">{getCardLabel(expandedCard.type)}</Text>
                </View>
              </View>
              <View className="h-[1px] bg-gray-100" />
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 bg-gray-100 rounded-xl items-center justify-center">
                  <User size={16} color="#6b7280" />
                </View>
                <View>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cardholder</Text>
                  <Text className="font-medium text-gray-900 text-sm">{expandedCard.cardholder}</Text>
                </View>
              </View>
              <View className="h-[1px] bg-gray-100" />
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 bg-gray-100 rounded-xl items-center justify-center">
                  <Calendar size={16} color="#6b7280" />
                </View>
                <View>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expires</Text>
                  <Text className="font-medium text-gray-900 text-sm">{expandedCard.expires ?? 'N/A'}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(true)}
                className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-white rounded-2xl shadow-sm"
              >
                <Pencil size={16} color="#374151" />
                <Text className="text-sm font-bold text-gray-700">Edit Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteCard}
                className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-white rounded-2xl shadow-sm"
              >
                <Trash2 size={16} color="#dc2626" />
                <Text className="text-sm font-bold text-red-600">Remove</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* Normal wallet view */}
      <Header title="My Wallet" activeTab={activeTab} onNavigate={onNavigate} leftAction={addButton} />

      <View className="px-6 mt-8 flex-1">
        <View style={{ height: 360, position: 'relative' }}>
          {cards.map((card, index) => (
            <View
              key={card.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: [{ translateY: index * 40 }, { scale: 1 - index * 0.05 }],
                opacity: 1 - index * 0.15,
                zIndex: cards.length - index,
              }}
            >
              <CreditCard
                type={card.type}
                cardholder={card.cardholder}
                last4={card.last4}
                expires={card.expires}
                onClick={() => handleCardClick(card.id, index)}
              />
            </View>
          ))}

          {cards.length === 0 && (
            <View className="h-[220px] items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl">
              <Text className="text-gray-400 font-medium">No cards yet</Text>
            </View>
          )}
        </View>
      </View>

      {isModalOpen && <AddCardModal onClose={() => setIsModalOpen(false)} />}

      {/* Edit card modal */}
      {isEditModalOpen && expandedCard && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setIsEditModalOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsEditModalOpen(false)} activeOpacity={1} />
            <View className="bg-white rounded-t-3xl p-6 pb-10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">Edit Card</Text>
                <TouchableOpacity onPress={() => setIsEditModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} color="#4b5563" />
                </TouchableOpacity>
              </View>
              <View className="gap-4">
                <View>
                  <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Card Number</Text>
                  <TextInput
                    defaultValue={`**** **** **** ${expandedCard.last4}`}
                    editable={false}
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium text-gray-400"
                  />
                </View>
                <View>
                  <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Cardholder Name</Text>
                  <TextInput
                    defaultValue={expandedCard.cardholder}
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                  />
                </View>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Expiry Date</Text>
                    <TextInput
                      defaultValue={expandedCard.expires ?? ''}
                      placeholder="MM/YY"
                      className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">CVV</Text>
                    <TextInput
                      placeholder="***"
                      secureTextEntry
                      className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                    />
                  </View>
                </View>
                <TouchableOpacity onPress={() => setIsEditModalOpen(false)} className="w-full py-4 bg-gray-900 rounded-xl mt-2">
                  <Text className="text-white font-bold text-center">Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
