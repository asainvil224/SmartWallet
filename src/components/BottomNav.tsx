import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CreditCard, Wallet, Clock, User } from 'lucide-react-native';

interface BottomNavProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const tabs = [
    { id: 'payment', icon: CreditCard },
    { id: 'wallet', icon: Wallet },
    { id: 'history', icon: Clock },
    { id: 'profile', icon: User },
  ];

  return (
    <View className="w-full bg-white border-t border-gray-100 px-8 py-3 flex-row justify-between items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onChange(tab.id)}
            className="items-center"
          >
            <View className={`p-2 rounded-xl ${isActive ? 'bg-gray-100' : 'bg-transparent'}`}>
              <Icon size={22} color={isActive ? '#111827' : '#9ca3af'} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
