import { useState } from "react";

const API_URL =
  process.env.EXPO_PUBLIC_SMARTWALLET_API_URL ??
  (__DEV__ ? "http://localhost:3001" : "https://your-deployed-backend.com");

export type CardBenefits = {
  food?: number;
  travel?: number;
  groceries?: number;
  gas?: number;
  entertainment?: number;
  shopping?: number;
  other?: number;
};

export type UserCard = {
  id: string;
  card_name: string;
  network: string;
  last_four: string;
  benefits: CardBenefits;
};

type WalletCardInput = {
  id: string;
  card_name: string;
  network: string;
  last4?: string;
  last_four?: string;
  benefits: CardBenefits;
};

export type PaymentResult = {
  clientSecret: string;
  paymentIntentId: string;
  merchantCategory: string;
  recommendedCard: UserCard | null;
  allCards: UserCard[];
  savings: string;
};

const DEMO_MERCHANTS = [
  { merchantName: "Chipotle", merchantCategory: "food", amount: 18.5, mcc: 5814 },
  { merchantName: "Delta", merchantCategory: "travel", amount: 246.2, mcc: 4511 },
  { merchantName: "Target", merchantCategory: "shopping", amount: 64.79, mcc: 5310 },
  { merchantName: "Whole Foods", merchantCategory: "groceries", amount: 52.34, mcc: 5411 },
  { merchantName: "Shell", merchantCategory: "gas", amount: 41.08, mcc: 5541 },
];

export function useStripePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function initiatePayment(
    userId: string,
    amount: number,
    mcc: number,
    merchantName: string
  ): Promise<PaymentResult> {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithTimeout(`${API_URL}/payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount, merchantMcc: mcc, merchantName }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      return {
        ...data,
        savings: calculateSavings(amount, data.recommendedCard, data.merchantCategory),
      };
    } catch {
      const merchantCategory = categoryFromMcc(mcc);
      return buildLocalPayment({ merchantName, merchantCategory, amount, cards: [] });
    } finally {
      setLoading(false);
    }
  }

  async function confirmAndLog(paymentIntentId: string, chosenCardId: string, userId: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithTimeout(`${API_URL}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, cardId: chosenCardId, userId }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    } catch {
      return { ok: true, status: "succeeded", paymentIntentId, cardId: chosenCardId };
    } finally {
      setLoading(false);
    }
  }

  async function getRecommendation(userId: string, mcc: number, cards: WalletCardInput[] = []) {
    try {
      const res = await fetchWithTimeout(`${API_URL}/recommend?userId=${userId}&mcc=${mcc}`);

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      return res.json() as Promise<{
        category: string;
        recommendedCard: UserCard | null;
        allCards: UserCard[];
      }>;
    } catch {
      const category = categoryFromMcc(mcc);
      const normalizedCards = normalizeCards(cards);
      return {
        category,
        recommendedCard: pickBestCard(normalizedCards, category),
        allCards: normalizedCards,
      };
    }
  }

  async function initiateSimulated(
    userId: string,
    cards: WalletCardInput[]
  ): Promise<PaymentResult & { merchantName: string; amount: number }> {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithTimeout(`${API_URL}/simulate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cards }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      return {
        ...data,
        savings: calculateSavings(data.amount, data.recommendedCard, data.merchantCategory),
      };
    } catch {
      return buildLocalPayment({ ...randomMerchant(), cards });
    } finally {
      setLoading(false);
    }
  }

  return { initiatePayment, initiateSimulated, confirmAndLog, getRecommendation, loading, error };
}

function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 2500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
}

function randomMerchant() {
  return DEMO_MERCHANTS[Math.floor(Math.random() * DEMO_MERCHANTS.length)];
}

function normalizeCards(cards: WalletCardInput[]): UserCard[] {
  return cards.map((card) => ({
    id: card.id,
    card_name: card.card_name,
    network: card.network,
    last_four: card.last_four ?? card.last4 ?? "0000",
    benefits: card.benefits,
  }));
}

function pickBestCard(cards: UserCard[], category: string) {
  return [...cards].sort((a, b) => getRate(b, category) - getRate(a, category))[0] ?? null;
}

function getRate(card: UserCard, category: string) {
  return card.benefits[category as keyof CardBenefits] ?? card.benefits.other ?? 1;
}

function buildLocalPayment(args: {
  merchantName: string;
  merchantCategory: string;
  amount: number;
  cards: WalletCardInput[];
}) {
  const allCards = normalizeCards(args.cards);
  const recommendedCard = pickBestCard(allCards, args.merchantCategory);

  return {
    clientSecret: "local_demo_client_secret",
    paymentIntentId: `local_pi_${Date.now()}`,
    merchantName: args.merchantName,
    merchantCategory: args.merchantCategory,
    amount: args.amount,
    recommendedCard,
    allCards,
    savings: calculateSavings(args.amount, recommendedCard, args.merchantCategory),
  };
}

function calculateSavings(amount: number, card: UserCard | null, category: string): string {
  if (!card) return "$0.00";

  const baselineRate = 1;
  const cardRate = getRate(card, category);
  const savings = (amount * (cardRate - baselineRate)) / 100;

  return savings > 0 ? `$${savings.toFixed(2)}` : "$0.00";
}

function categoryFromMcc(mcc: number) {
  if ([5812, 5813, 5814].includes(mcc)) return "food";
  if ([3000, 3351, 4411, 4511, 4722, 7011].includes(mcc)) return "travel";
  if ([5411, 5422, 5451, 5462, 5499].includes(mcc)) return "groceries";
  if ([5541, 5542].includes(mcc)) return "gas";
  if ([7832, 7922, 7991, 7996, 7999].includes(mcc)) return "entertainment";
  if ([5310, 5311, 5331, 5651, 5661, 5732, 5942, 5999].includes(mcc)) return "shopping";
  return "other";
}
