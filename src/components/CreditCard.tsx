import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CreditCardProps {
  type: 'cent' | 'mastercard' | 'blue';
  cardholder: string;
  last4: string;
  expires?: string;
  onClick?: () => void;
}

export function CreditCard({ type, cardholder, last4, expires, onClick }: CreditCardProps) {
  const bgColor = type === 'blue' ? '#1E4D8C' : '#5A5A5A';

  const inner = (
    <View style={[styles.inner, { backgroundColor: bgColor }]}>
      {/* Decorative circles */}
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <View className="flex-1 flex-col justify-between" style={{ zIndex: 1 }}>
        <View className="flex-row justify-between items-start">
          {type === 'cent' && (
            <>
              <Text style={{ color: '#39FF14', fontSize: 24, fontWeight: 'bold' }}>$</Text>
              <Text className="font-bold text-lg text-white" style={{ letterSpacing: 4 }}>SmartWallet</Text>
            </>
          )}
          {type === 'mastercard' && (
            <View>
              <Text className="font-bold text-sm text-white tracking-wider">MASTERCARD</Text>
              <Text className="text-sm text-gray-300 font-medium mt-1">Standard</Text>
            </View>
          )}
          {type === 'blue' && (
            <View>
              <Text className="font-bold text-sm text-white tracking-wider">VISA</Text>
              <Text className="text-sm text-blue-200 font-medium mt-1">Platinum</Text>
            </View>
          )}
        </View>

        <Text className="text-2xl font-medium text-white mt-6" style={{ letterSpacing: 4 }}>
          **** **** **** {last4}
        </Text>

        <View className="flex-row justify-between items-end mt-4">
          <View>
            <Text className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">
              Cardholder
            </Text>
            <Text className="font-medium text-sm text-white">{cardholder}</Text>
          </View>
          {expires && (
            <View className="items-end">
              <Text className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">
                Expires
              </Text>
              <Text className="font-medium text-sm text-white">{expires}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (onClick) {
    return (
      <View style={styles.shadow}>
        <TouchableOpacity activeOpacity={0.9} onPress={onClick}>
          {inner}
        </TouchableOpacity>
      </View>
    );
  }

  return <View style={styles.shadow}>{inner}</View>;
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  inner: {
    borderRadius: 16,
    padding: 24,
    height: 220,
    overflow: 'hidden',
  },
  circleTop: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circleBottom: {
    position: 'absolute',
    bottom: -48,
    left: -48,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
