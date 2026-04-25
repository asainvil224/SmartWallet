import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';

export function AddCardModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableOpacity className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onClose} activeOpacity={1} />
        <View className="bg-white rounded-t-3xl p-6 pb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Add New Card</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <X size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                Card Number
              </Text>
              <TextInput
                placeholder="0000 0000 0000 0000"
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                keyboardType="number-pad"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Expiry Date
                </Text>
                <TextInput
                  placeholder="MM/YY"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  CVV
                </Text>
                <TextInput
                  placeholder="123"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                  keyboardType="number-pad"
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity onPress={onClose} className="w-full py-4 bg-gray-900 rounded-xl mt-2">
              <Text className="text-white font-bold text-center">Add Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
