import React from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react-native';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';

interface MyProfileProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  session: Session | null;
}

export function MyProfile({ activeTab, onNavigate, session }: MyProfileProps) {
  const email = session?.user.email ?? 'No email found';
  const displayName = email.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase() || 'U';

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Sign out failed', error.message);
    }
  };

  return (
    <View className="flex-1 bg-[#F2F3F5]">
      <Header title="My Profile" activeTab={activeTab} onNavigate={onNavigate} />
      <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-white rounded-[2rem] p-8 items-center shadow-sm mb-8">
          <View className="w-24 h-24 bg-[#5A5A5A] rounded-full items-center justify-center mb-4">
            <Text className="text-white text-4xl font-bold">{initial}</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 capitalize">{displayName}</Text>
          <Text className="text-gray-500 text-sm mt-1 font-medium">{email}</Text>
        </View>

        <Text className="font-bold text-gray-900 mb-4 text-lg">Account Information</Text>
        <View className="gap-3">
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <Text className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 uppercase">Email</Text>
            <Text className="font-medium text-gray-900">{email}</Text>
          </View>
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <Text className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 uppercase">Name</Text>
            <Text className="font-medium text-gray-900 capitalize">{displayName}</Text>
          </View>
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <Text className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 uppercase">User ID</Text>
            <Text className="font-medium text-gray-900">{session?.user.id ?? 'N/A'}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          className="mt-6 flex-row items-center justify-center gap-2 bg-gray-900 rounded-2xl py-4"
        >
          <LogOut size={18} color="white" />
          <Text className="text-white font-bold">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
