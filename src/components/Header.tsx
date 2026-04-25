import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MoreVertical, CreditCard, Wallet, Clock, User } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  activeTab: string;
  onNavigate: (tab: string) => void;
  leftAction?: React.ReactNode;
}

const navItems = [
  { id: 'payment', label: 'Make a Payment', icon: CreditCard },
  { id: 'wallet', label: 'My Wallet', icon: Wallet },
  { id: 'history', label: 'Transaction History', icon: Clock },
  { id: 'profile', label: 'My Profile', icon: User },
];

export function Header({ title, activeTab, onNavigate, leftAction }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
      <View className="w-8">
        {leftAction ?? <View />}
      </View>

      <Text className="text-xl font-bold text-gray-900">{title}</Text>

      <View>
        <TouchableOpacity
          onPress={() => setIsOpen(!isOpen)}
          className="w-8 h-8 bg-[#4A4A4A] rounded-full items-center justify-center"
        >
          <MoreVertical size={18} color="white" />
        </TouchableOpacity>

        {isOpen && (
          <View
            className="absolute right-0 top-10 w-52 bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ zIndex: 50, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 }}
          >
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <View key={item.id}>
                  {index > 0 && <View className="h-[1px] bg-gray-100" />}
                  <TouchableOpacity
                    onPress={() => {
                      onNavigate(item.id);
                      setIsOpen(false);
                    }}
                    className={`flex-row items-center gap-3 px-4 py-3 ${isActive ? 'bg-gray-50' : ''}`}
                  >
                    <Icon size={16} color={isActive ? '#111827' : '#6b7280'} />
                    <Text className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
