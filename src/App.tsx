import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Animated, Linking, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MakePayment } from './pages/MakePayment';
import { MyWallet } from './pages/MyWallet';
import { TransactionHistory } from './pages/TransactionHistory';
import { MyProfile } from './pages/MyProfile';
import { AuthScreen } from './screens/AuthScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';
import { supabase } from './lib/supabase';

function getLinkParams(url: string) {
  const params = new URLSearchParams();
  const query = url.split('?')[1]?.split('#')[0];
  const fragment = url.split('#')[1];

  if (query) {
    new URLSearchParams(query).forEach((value, key) => params.set(key, value));
  }

  if (fragment) {
    new URLSearchParams(fragment).forEach((value, key) => params.set(key, value));
  }

  return params;
}

export function App() {
  const [activeTab, setActiveTab] = useState('payment');
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResettingPassword(true);
      }

      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handlePasswordResetLink = async (url: string | null) => {
      if (!url) return;

      const params = getLinkParams(url);
      const type = params.get('type');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (type !== 'recovery' || !accessToken || !refreshToken) return;

      setIsResettingPassword(true);

      const { data } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      setSession(data.session);
    };

    Linking.getInitialURL().then(handlePasswordResetLink);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handlePasswordResetLink(url);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!session?.user.email) return;

    supabase.from('users').upsert({
      id: session.user.id,
      email: session.user.email,
    });
  }, [session?.user.email, session?.user.id]);

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

  const renderTab = () => {
    switch (activeTab) {
      case 'payment':
        return <MakePayment activeTab={activeTab} onNavigate={handleNavigate} />;
      case 'wallet':
        return <MyWallet activeTab={activeTab} onNavigate={handleNavigate} />;
      case 'history':
        return <TransactionHistory activeTab={activeTab} onNavigate={handleNavigate} />;
      case 'profile':
        return <MyProfile activeTab={activeTab} onNavigate={handleNavigate} session={session} />;
      default:
        return <MakePayment activeTab={activeTab} onNavigate={handleNavigate} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#F2F3F5]">
        {isAuthLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#111827" />
          </View>
        ) : session ? (
          isResettingPassword ? (
            <ResetPasswordScreen onComplete={() => setIsResettingPassword(false)} />
          ) : (
            <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
              {renderTab()}
            </Animated.View>
          )
        ) : (
          <AuthScreen />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
