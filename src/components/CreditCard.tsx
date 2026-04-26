import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type CardType =
  | 'cent'
  | 'chase-sapphire'
  | 'chase-freedom'
  | 'amex-gold'
  | 'amex-platinum'
  | 'capital-one-venture'
  | 'capital-one-quicksilver'
  | 'citi-double'
  | 'discover';

interface CreditCardProps {
  type: CardType;
  cardholder: string;
  last4: string;
  expires?: string;
  onClick?: () => void;
}

interface CardConfig {
  bg: string;
  shimmer: string;
  accent: string;
  bank: string;
  product: string;
  network: string;
  networkColor: string;
  chipColor: string;
}

const CONFIGS: Record<CardType, CardConfig> = {
  'cent': {
    bg: '#1C1C1C', shimmer: '#3A3A3A',
    accent: '#39FF14',
    bank: 'SmartWallet', product: '',
    network: '', networkColor: '#39FF14',
    chipColor: '#39FF14',
  },
  'chase-sapphire': {
    bg: '#0A1628', shimmer: '#162644',
    accent: '#C9A84C',
    bank: 'CHASE', product: 'Sapphire Reserve',
    network: 'VISA', networkColor: '#C9A84C',
    chipColor: '#C9A84C',
  },
  'chase-freedom': {
    bg: '#003087', shimmer: '#0040A8',
    accent: '#FFFFFF',
    bank: 'CHASE', product: 'Freedom Unlimited',
    network: 'VISA', networkColor: '#FFFFFF',
    chipColor: '#FFD700',
  },
  'amex-gold': {
    bg: '#8B5E1A', shimmer: '#B8832A',
    accent: '#FFE08A',
    bank: 'AMERICAN EXPRESS', product: 'Gold Card',
    network: 'AMEX', networkColor: '#FFE08A',
    chipColor: '#FFE08A',
  },
  'amex-platinum': {
    bg: '#1C1C1C', shimmer: '#2E2E2E',
    accent: '#C8C8C8',
    bank: 'AMERICAN EXPRESS', product: 'Platinum Card',
    network: 'AMEX', networkColor: '#C8C8C8',
    chipColor: '#C8C8C8',
  },
  'capital-one-venture': {
    bg: '#5C0000', shimmer: '#8B0000',
    accent: '#FF8A80',
    bank: 'CAPITAL ONE', product: 'Venture Rewards',
    network: 'VISA', networkColor: '#FF8A80',
    chipColor: '#FFD700',
  },
  'capital-one-quicksilver': {
    bg: '#0D0F1A', shimmer: '#1A1D30',
    accent: '#A0B0C0',
    bank: 'CAPITAL ONE', product: 'Quicksilver',
    network: 'MASTERCARD', networkColor: '#A0B0C0',
    chipColor: '#FFD700',
  },
  'citi-double': {
    bg: '#002D4A', shimmer: '#004470',
    accent: '#4FC3F7',
    bank: 'CITI', product: 'Double Cash',
    network: 'MASTERCARD', networkColor: '#4FC3F7',
    chipColor: '#FFD700',
  },
  'discover': {
    bg: '#A03500', shimmer: '#C94400',
    accent: '#FFB347',
    bank: 'DISCOVER', product: 'it® Cash Back',
    network: 'DISCOVER', networkColor: '#FFB347',
    chipColor: '#FFD700',
  },
};

export function CreditCard({ type, cardholder, last4, expires, onClick }: CreditCardProps) {
  const cfg = CONFIGS[type];

  const inner = (
    <View style={[styles.card, { backgroundColor: cfg.bg }]}>
      {/* Shimmer layer top-right */}
      <View style={[styles.circleA, { backgroundColor: cfg.shimmer }]} />
      {/* Shimmer layer bottom-left */}
      <View style={[styles.circleB, { backgroundColor: cfg.shimmer, opacity: 0.5 }]} />
      {/* Subtle accent circle */}
      <View style={[styles.circleC, { borderColor: cfg.accent, opacity: 0.12 }]} />

      <View style={{ flex: 1, zIndex: 1 }}>
        {/* Top row — bank name + network */}
        <View style={styles.topRow}>
          {type === 'cent' ? (
            <>
              <Text style={[styles.centDollar, { color: cfg.accent }]}>$</Text>
              <Text style={[styles.bankBold, { color: '#FFFFFF', letterSpacing: 3 }]}>SmartWallet</Text>
            </>
          ) : (
            <>
              <View>
                <Text style={[styles.bankBold, { color: cfg.accent }]}>{cfg.bank}</Text>
                {cfg.product ? (
                  <Text style={[styles.product, { color: cfg.accent, opacity: 0.75 }]}>{cfg.product}</Text>
                ) : null}
              </View>
              {cfg.network ? (
                <Text style={[styles.network, { color: cfg.networkColor }]}>{cfg.network}</Text>
              ) : null}
            </>
          )}
        </View>

        {/* EMV Chip */}
        <View style={[styles.chip, { backgroundColor: cfg.chipColor }]}>
          <View style={[styles.chipLine, { backgroundColor: cfg.bg, opacity: 0.4 }]} />
          <View style={[styles.chipLine, { backgroundColor: cfg.bg, opacity: 0.4, marginTop: 4 }]} />
        </View>

        {/* Card number */}
        <Text style={[styles.cardNumber, { color: 'rgba(255,255,255,0.9)' }]}>
          •••• •••• •••• {last4}
        </Text>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.label}>Cardholder</Text>
            <Text style={styles.value}>{cardholder}</Text>
          </View>
          {expires ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>Expires</Text>
              <Text style={styles.value}>{expires}</Text>
            </View>
          ) : null}

          {/* Mastercard rings */}
          {cfg.network === 'MASTERCARD' && (
            <View style={styles.mcWrap}>
              <View style={[styles.mcCircle, { backgroundColor: '#EB001B', marginRight: -10 }]} />
              <View style={[styles.mcCircle, { backgroundColor: '#F79E1B', opacity: 0.85 }]} />
            </View>
          )}

          {/* Discover ring */}
          {cfg.network === 'DISCOVER' && (
            <View style={[styles.mcCircle, { backgroundColor: '#FFB347', width: 36, height: 36, borderRadius: 18 }]} />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.shadow}>
      {onClick ? (
        <TouchableOpacity activeOpacity={0.9} onPress={onClick}>{inner}</TouchableOpacity>
      ) : inner}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    height: 220,
    overflow: 'hidden',
  },
  circleA: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.35,
  },
  circleB: {
    position: 'absolute',
    bottom: -70,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  circleC: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  centDollar: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  bankBold: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  product: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  network: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  chip: {
    width: 40,
    height: 30,
    borderRadius: 5,
    marginTop: 14,
    marginBottom: 10,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  chipLine: {
    height: 2,
    borderRadius: 1,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  label: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  mcWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mcCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});
