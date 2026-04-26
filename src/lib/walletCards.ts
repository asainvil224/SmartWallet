import { CardType } from '../components/CreditCard';

export interface WalletCard {
  id: string;
  type: CardType;
  cardholder: string;
  last4: string;
  expires?: string;
  card_name: string;
  network: string;
  benefits: Record<string, number>;
}

export const WALLET_CARDS: WalletCard[] = [
  {
    id: '1', type: 'chase-sapphire', cardholder: 'Jason', last4: '4242', expires: '6/2029',
    card_name: 'Chase Sapphire Reserve', network: 'visa',
    benefits: { food: 3, travel: 3, groceries: 1, gas: 1, entertainment: 1, shopping: 1, other: 1 },
  },
  {
    id: '2', type: 'amex-gold', cardholder: 'Jason', last4: '1005', expires: '3/2027',
    card_name: 'Amex Gold Card', network: 'amex',
    benefits: { food: 4, groceries: 4, travel: 3, gas: 1, entertainment: 1, shopping: 1, other: 1 },
  },
  {
    id: '3', type: 'capital-one-venture', cardholder: 'Jason', last4: '3391', expires: '11/2028',
    card_name: 'Capital One Venture', network: 'visa',
    benefits: { travel: 2, food: 2, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 },
  },
  {
    id: '4', type: 'amex-platinum', cardholder: 'Jason', last4: '0052', expires: '8/2026',
    card_name: 'Amex Platinum Card', network: 'amex',
    benefits: { travel: 5, food: 1, groceries: 1, gas: 1, entertainment: 1, shopping: 1, other: 1 },
  },
  {
    id: '5', type: 'citi-double', cardholder: 'Jason', last4: '5555', expires: '1/2030',
    card_name: 'Citi Double Cash', network: 'mastercard',
    benefits: { food: 2, travel: 2, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 },
  },
  {
    id: '6', type: 'capital-one-quicksilver', cardholder: 'Jason', last4: '7712', expires: '4/2028',
    card_name: 'Capital One Quicksilver', network: 'visa',
    benefits: { food: 2, travel: 2, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 },
  },
  {
    id: '7', type: 'discover', cardholder: 'Jason', last4: '1234', expires: '9/2027',
    card_name: 'Discover it Cash Back', network: 'discover',
    benefits: { entertainment: 5, shopping: 5, food: 1, travel: 1, groceries: 1, gas: 1, other: 1 },
  },
  {
    id: '8', type: 'chase-freedom', cardholder: 'Jason', last4: '8821', expires: '2/2031',
    card_name: 'Chase Freedom Unlimited', network: 'visa',
    benefits: { food: 3, travel: 5, groceries: 2, gas: 2, entertainment: 2, shopping: 2, other: 2 },
  },
];
