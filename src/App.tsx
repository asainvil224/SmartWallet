import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MakePayment } from './pages/MakePayment';
import { MyWallet } from './pages/MyWallet';
import { TransactionHistory } from './pages/TransactionHistory';
import { MyProfile } from './pages/MyProfile';
import { AuthScreen } from './screens/AuthScreen';
import { supabase } from './lib/supabase';
import { RewardPreference, WALLET_CARDS, WalletCard, WalletTransaction } from './lib/walletCards';
import { CardType } from './components/CreditCard';

const STORAGE_KEYS = {
  walletCards: 'smartwallet.walletCards',
  rewardPreference: 'smartwallet.rewardPreference',
  localTransactions: 'smartwallet.localTransactions',
};

type UserCardRow = {
  id: string;
  card_name: string;
  network: string;
  last_four: string;
  benefits: Record<string, number>;
  created_at?: string;
};

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payment');
  const [walletCards, setWalletCards] = useState<WalletCard[]>(WALLET_CARDS);
  const [rewardPreference, setRewardPreference] = useState<RewardPreference>('category');
  const [localTransactions, setLocalTransactions] = useState<WalletTransaction[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const userId = session?.user.id ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setActiveTab('payment');
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const hydrate = async () => {
      setIsHydrated(false);

      if (!userId) {
        setWalletCards(WALLET_CARDS);
        setRewardPreference('category');
        setLocalTransactions([]);
        setIsHydrated(true);
        return;
      }

      try {
        const keys = getStorageKeys(userId);
        const [storedCards, storedPreference, storedTransactions] = await Promise.all([
          AsyncStorage.getItem(keys.walletCards),
          AsyncStorage.getItem(keys.rewardPreference),
          AsyncStorage.getItem(keys.localTransactions),
        ]);

        let nextCards = WALLET_CARDS;

        if (storedCards) {
          const parsedCards = JSON.parse(storedCards) as WalletCard[];
          if (Array.isArray(parsedCards) && parsedCards.length > 0) nextCards = parsedCards;
        }

        const { data: remoteCards } = await supabase
          .from('user_cards')
          .select('id, card_name, network, last_four, benefits, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (remoteCards && remoteCards.length > 0) {
          nextCards = mergeCards(remoteCards.map(mapUserCardRow), nextCards);
        }

        setWalletCards(nextCards);

        if (isRewardPreference(storedPreference)) {
          setRewardPreference(storedPreference);
        } else {
          setRewardPreference('category');
        }

        if (storedTransactions) {
          const parsedTransactions = JSON.parse(storedTransactions) as WalletTransaction[];
          setLocalTransactions(Array.isArray(parsedTransactions) ? parsedTransactions : []);
        } else {
          setLocalTransactions([]);
        }
      } finally {
        setIsHydrated(true);
      }
    };

    hydrate();
  }, [authLoading, userId]);

  useEffect(() => {
    if (!isHydrated || !userId) return;
    AsyncStorage.setItem(getStorageKeys(userId).walletCards, JSON.stringify(walletCards));
  }, [isHydrated, userId, walletCards]);

  useEffect(() => {
    if (!isHydrated || !userId) return;
    AsyncStorage.setItem(getStorageKeys(userId).rewardPreference, rewardPreference);
  }, [isHydrated, userId, rewardPreference]);

  useEffect(() => {
    if (!isHydrated || !userId) return;
    AsyncStorage.setItem(getStorageKeys(userId).localTransactions, JSON.stringify(localTransactions));
  }, [isHydrated, userId, localTransactions]);

  const handleNavigate = (tab: string) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleAddCard = (card: WalletCard) => {
    setWalletCards((current) => mergeCards([card], current));
  };

  const handleDeleteCard = (cardId: string) => {
    setWalletCards((current) => current.filter((card) => card.id !== cardId));
  };

  const handlePromoteCard = (cardId: string) => {
    setWalletCards((current) => {
      const index = current.findIndex((card) => card.id === cardId);
      if (index <= 0) return current;

      const next = [...current];
      const [selectedCard] = next.splice(index, 1);
      return [selectedCard, ...next];
    });
  };

  const handleTransactionAdded = (transaction: WalletTransaction) => {
    setLocalTransactions((current) => [transaction, ...current]);
  };

  const renderTab = () => {
    if (!userId) return null;

    switch (activeTab) {
      case 'payment':
        return (
          <MakePayment
            activeTab={activeTab}
            onNavigate={handleNavigate}
            walletCards={walletCards}
            rewardPreference={rewardPreference}
            userId={userId}
            onTransactionAdded={handleTransactionAdded}
          />
        );
      case 'wallet':
        return (
          <MyWallet
            activeTab={activeTab}
            onNavigate={handleNavigate}
            cards={walletCards}
            userId={userId}
            onCardAdded={handleAddCard}
            onCardDeleted={handleDeleteCard}
            onCardPromoted={handlePromoteCard}
          />
        );
      case 'history':
        return <TransactionHistory activeTab={activeTab} onNavigate={handleNavigate} userId={userId} localTransactions={localTransactions} />;
      case 'profile':
        return (
          <MyProfile
            activeTab={activeTab}
            onNavigate={handleNavigate}
            session={session}
            rewardPreference={rewardPreference}
            onRewardPreferenceChange={setRewardPreference}
          />
        );
      default:
        return (
          <MakePayment
            activeTab={activeTab}
            onNavigate={handleNavigate}
            walletCards={walletCards}
            rewardPreference={rewardPreference}
            userId={userId}
            onTransactionAdded={handleTransactionAdded}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#F2F3F5]">
        {authLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#111827" />
          </View>
        ) : !session ? (
          <AuthScreen />
        ) : (
          <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
            {renderTab()}
          </Animated.View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function isRewardPreference(value: string | null): value is RewardPreference {
  return value === 'category' || value === 'cashback' || value === 'travel' || value === 'food' || value === 'groceries' || value === 'gas' || value === 'shopping';
}

function getStorageKeys(userId: string) {
  return {
    walletCards: `${STORAGE_KEYS.walletCards}.${userId}`,
    rewardPreference: `${STORAGE_KEYS.rewardPreference}.${userId}`,
    localTransactions: `${STORAGE_KEYS.localTransactions}.${userId}`,
  };
}

function mapUserCardRow(row: UserCardRow): WalletCard {
  return {
    id: row.id,
    type: inferCardType(row.card_name, row.network, row.benefits),
    cardholder: 'Jason',
    last4: row.last_four,
    expires: undefined,
    card_name: row.card_name,
    network: row.network,
    rewardStyle: inferRewardStyle(row.card_name, row.benefits),
    benefits: row.benefits ?? { other: 1 },
  };
}

function mergeCards(primary: WalletCard[], fallback: WalletCard[]) {
  const seen = new Set<string>();
  const merged: WalletCard[] = [];

  for (const card of [...primary, ...fallback]) {
    const key = `${card.card_name.toLowerCase()}-${card.last4}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(card);
  }

  return merged;
}

function inferCardType(cardName: string, network: string, benefits: Record<string, number>): CardType {
  const name = cardName.toLowerCase();
  if (name.includes('sapphire')) return 'chase-sapphire';
  if (name.includes('freedom')) return 'chase-freedom';
  if (name.includes('platinum')) return 'amex-platinum';
  if (name.includes('gold')) return 'amex-gold';
  if (name.includes('venture')) return 'capital-one-venture';
  if (name.includes('quicksilver')) return 'capital-one-quicksilver';
  if (name.includes('double')) return 'citi-double';
  if (network.toLowerCase().includes('discover')) return 'discover';
  if ((benefits.groceries ?? 0) >= 5 || (benefits.shopping ?? 0) >= 5) return 'discover';
  if (network.toLowerCase().includes('amex')) return 'amex-gold';
  if (network.toLowerCase().includes('mastercard')) return 'citi-double';
  return 'chase-sapphire';
}

function inferRewardStyle(cardName: string, benefits: Record<string, number>): RewardPreference {
  const name = cardName.toLowerCase();
  if (name.includes('cash') || name.includes('quicksilver') || name.includes('discover')) return 'cashback';
  if (name.includes('travel') || name.includes('venture') || name.includes('sapphire') || name.includes('platinum')) return 'travel';
  if ((benefits.other ?? 0) >= 2) return 'cashback';
  return 'category';
}



