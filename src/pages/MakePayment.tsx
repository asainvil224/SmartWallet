import React from 'react';
import { Header } from '../components/Header';
import { CreditCard } from '../components/CreditCard';
import { Wifi } from 'lucide-react';
interface MakePaymentProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}
export function MakePayment({ activeTab, onNavigate }: MakePaymentProps) {
  return (
    <div className="flex flex-col h-full bg-[#F2F3F5]">
      <Header
        title="Make a Payment"
        activeTab={activeTab}
        onNavigate={onNavigate} />
      
      <div className="px-6 mt-8 flex-1">
        <CreditCard
          type="cent"
          cardholder="Jason"
          last4="4444"
          expires="6/2029" />
        
        <div className="flex items-center justify-center gap-2 mt-8 text-gray-400">
          <Wifi className="rotate-90" size={20} />
          <span className="text-sm font-medium">Double tap card to pay</span>
        </div>
      </div>
    </div>);

}