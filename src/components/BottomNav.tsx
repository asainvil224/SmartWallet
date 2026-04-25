import React from 'react';
import { CreditCard, Wallet, Clock, User } from 'lucide-react';
interface BottomNavProps {
  activeTab: string;
  onChange: (tab: string) => void;
}
export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const tabs = [
  {
    id: 'payment',
    icon: CreditCard,
    label: 'Payment'
  },
  {
    id: 'wallet',
    icon: Wallet,
    label: 'Wallet'
  },
  {
    id: 'history',
    icon: Clock,
    label: 'History'
  },
  {
    id: 'profile',
    icon: User,
    label: 'Profile'
  }];

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-8 py-4 pb-8 flex justify-between items-center z-50 rounded-b-[2.5rem]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
            
            <div
              className={`p-2 rounded-xl ${isActive ? 'bg-gray-100' : 'bg-transparent'}`}>
              
              <Icon
                size={22}
                className={isActive ? 'fill-gray-900 text-gray-900' : ''} />
              
            </div>
          </button>);

      })}
    </div>);

}