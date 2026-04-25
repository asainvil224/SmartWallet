import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Header } from '../components/Header';

interface MyProfileProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export function MyProfile({ activeTab, onNavigate }: MyProfileProps) {
  return (
    <View className="flex-1 bg-[#F2F3F5]">
      <Header title="My Profile" activeTab={activeTab} onNavigate={onNavigate} />
      <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-white rounded-[2rem] p-8 items-center shadow-sm mb-8">
          <View className="w-24 h-24 bg-[#5A5A5A] rounded-full items-center justify-center mb-4">
            <Text className="text-white text-4xl font-bold">J</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">Jason</Text>
          <Text className="text-gray-500 text-sm mt-1 font-medium">hacker@gmail.com</Text>
        </View>

        <Text className="font-bold text-gray-900 mb-4 text-lg">Account Information</Text>
        <View className="gap-3">
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <Text className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 uppercase">Email</Text>
            <Text className="font-medium text-gray-900">hacker@gmail.com</Text>
          </View>
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <Text className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 uppercase">Name</Text>
            <Text className="font-medium text-gray-900">Jason</Text>
          </View>
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <Text className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 uppercase">Phone</Text>
            <Text className="font-medium text-gray-900">+1 (555) 123-4567</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
