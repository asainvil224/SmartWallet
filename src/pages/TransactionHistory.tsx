import React, { useState } from 'react';
import { Header } from '../components/Header';
import { RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const transactions = [
{
  id: '1',
  amount: 74.98,
  date: 'Oct 12, 2025 at 11:50 AM',
  status: 'Succeeded',
  card: 'CENT •••• 4444',
  rewards: '$1.12'
},
{
  id: '2',
  amount: 9.1,
  date: 'Oct 12, 2025 at 11:42 AM',
  status: 'Succeeded',
  card: 'CENT •••• 4444',
  rewards: '$0.14'
},
{
  id: '3',
  amount: 31.78,
  date: 'Oct 12, 2025 at 11:35 AM',
  status: 'Succeeded',
  card: 'CENT •••• 4444',
  rewards: '$0.48'
},
{
  id: '4',
  amount: 65.72,
  date: 'Oct 12, 2025 at 11:32 AM',
  status: 'Succeeded',
  card: 'CENT •••• 4444',
  rewards: '$0.99'
}];

interface TransactionHistoryProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}
export function TransactionHistory({
  activeTab,
  onNavigate
}: TransactionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <div className="flex flex-col h-full bg-[#F2F3F5]">
      <Header
        title="Transaction History"
        activeTab={activeTab}
        onNavigate={onNavigate} />
      

      <div className="px-6 mt-6 flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-gray-900">Transaction History</h2>
          <button className="flex items-center gap-2 bg-[#4A4A4A] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {transactions.map((tx) =>
          <motion.div
            key={tx.id}
            layout
            onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
            className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer overflow-hidden">
            
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#E8F8EE] rounded-full flex items-center justify-center text-[#39FF14]">
                    <Check size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      Payment
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 font-medium">
                      {tx.date}
                    </div>
                    <div className="text-xs font-bold text-[#39FF14] mt-1">
                      {tx.status}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-lg">
                    ${tx.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">
                    USD
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === tx.id &&
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                  marginTop: 0
                }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  marginTop: 16
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  marginTop: 0
                }}
                className="border-t border-gray-100 pt-4">
                
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">
                          Transaction ID
                        </span>
                        <span className="font-bold text-gray-900">
                          TXN-{tx.id}982374
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">
                          Card Used
                        </span>
                        <span className="font-bold text-gray-900">
                          {tx.card}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">
                          Rewards Earned
                        </span>
                        <span className="font-bold text-[#39FF14]">
                          {tx.rewards}{' '}
                          <span className="text-gray-400 font-medium text-xs">
                            (1.5% cashback)
                          </span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
              }
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>);

}