import { useState } from "react";

// iOS Simulator → localhost works. Android emulator → swap to http://10.0.2.2:3001
const API_URL = __DEV__
  ? "http://192.168.1.146:3001"
  : "https://your-deployed-backend.com";

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

export type PaymentResult = {
  clientSecret: string;
  paymentIntentId: string;
  merchantCategory: string;
  recommendedCard: UserCard | null;
  allCards: UserCard[];
  savings: string;
};

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
      const res = await fetch(`${API_URL}/payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount, merchantMcc: mcc, merchantName }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const savings = calculateSavings(amount, data.recommendedCard, data.merchantCategory);
      return { ...data, savings };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Backend confirms with pm_card_visa (Stripe test card) — no native SDK needed
  async function confirmAndLog(
    paymentIntentId: string,
    chosenCardId: string,
    userId: string
  ) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, cardId: chosenCardId, userId }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getRecommendation(userId: string, mcc: number) {
    const res = await fetch(`${API_URL}/recommend?userId=${userId}&mcc=${mcc}`);
    return res.json() as Promise<{
      category: string;
      recommendedCard: UserCard | null;
      allCards: UserCard[];
    }>;
  }

  // Calls /simulate-payment — backend picks a random merchant, recommends from the provided wallet cards
  async function initiateSimulated(userId: string, cards: object[]): Promise<PaymentResult & { merchantName: string; amount: number }> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/simulate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cards }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const savings = calculateSavings(data.amount, data.recommendedCard, data.merchantCategory);
      return { ...data, savings };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { initiatePayment, initiateSimulated, confirmAndLog, getRecommendation, loading, error };
}

function calculateSavings(amount: number, card: UserCard | null, category: string): string {
  if (!card) return "$0.00";
  const cardRate = card.benefits[category as keyof CardBenefits] ?? card.benefits.other ?? 1;
  const baselineRate = 1;
  const savings = (amount * (cardRate - baselineRate)) / 100;
  return savings > 0 ? `$${savings.toFixed(2)}` : "$0.00";
}
