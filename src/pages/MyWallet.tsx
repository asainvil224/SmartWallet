import React, { useState } from 'react';
import { Header } from '../components/Header';
import { CreditCard } from '../components/CreditCard';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  CreditCard as CardIcon,
  Calendar,
  User } from
'lucide-react';
import { AddCardModal } from '../components/AddCardModal';
import { motion, AnimatePresence } from 'framer-motion';
interface MyWalletProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}
type CardType = 'cent' | 'mastercard' | 'blue';
interface CardData {
  id: string;
  type: CardType;
  cardholder: string;
  last4: string;
  expires?: string;
}
const initialCards: CardData[] = [
{
  id: '1',
  type: 'mastercard',
  cardholder: 'Jason',
  last4: '4444'
},
{
  id: '2',
  type: 'blue',
  cardholder: 'Jason',
  last4: '4444'
},
{
  id: '3',
  type: 'cent',
  cardholder: 'Jason',
  last4: '4444',
  expires: '6/2029'
}];

function getCardLabel(type: CardType) {
  if (type === 'cent') return 'CENT';
  if (type === 'mastercard') return 'Mastercard Standard';
  if (type === 'blue') return 'Visa Platinum';
  return '';
}
export function MyWallet({ activeTab, onNavigate }: MyWalletProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const expandedCard = cards.find((c) => c.id === expandedCardId) || null;
  const handleCardClick = (clickedId: string, index: number) => {
    if (index === 0) {
      setExpandedCardId(clickedId);
    } else {
      setCards((prev) => {
        const newCards = [...prev];
        const [clicked] = newCards.splice(index, 1);
        newCards.unshift(clicked);
        return newCards;
      });
    }
  };
  const handleDeleteCard = () => {
    if (!expandedCardId) return;
    setCards((prev) => prev.filter((c) => c.id !== expandedCardId));
    setExpandedCardId(null);
  };
  const handleEditCard = () => {
    setIsEditModalOpen(true);
  };
  const addButton =
  <button
    onClick={() => setIsModalOpen(true)}
    className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors">
    
      <Plus size={18} />
    </button>;

  return (
    <div className="flex flex-col h-full bg-[#F2F3F5] relative">
      {/* Expanded Card Detail View */}
      <AnimatePresence>
        {expandedCard &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: 0.25
          }}
          className="absolute inset-0 z-40 bg-[#F2F3F5] flex flex-col rounded-[2.5rem] overflow-hidden">
          
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 pt-12">
              <button
              onClick={() => setExpandedCardId(null)}
              className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
              
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-lg font-bold text-gray-900">Card Details</h2>
              <div className="w-8" />
            </div>

            {/* Card */}
            <motion.div
            initial={{
              y: 30,
              scale: 0.95
            }}
            animate={{
              y: 0,
              scale: 1
            }}
            exit={{
              y: 30,
              scale: 0.95
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 28
            }}
            className="px-6 mt-4">
            
              <CreditCard
              type={expandedCard.type}
              cardholder={expandedCard.cardholder}
              last4={expandedCard.last4}
              expires={expandedCard.expires}
              className="shadow-2xl" />
            
            </motion.div>

            {/* Card Info */}
            <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.1,
              duration: 0.3
            }}
            className="px-6 mt-8 flex-1">
            
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <CardIcon size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Card Type
                    </div>
                    <div className="font-medium text-gray-900 text-sm">
                      {getCardLabel(expandedCard.type)}
                    </div>
                  </div>
                </div>
                <div className="h-[1px] bg-gray-100" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Cardholder
                    </div>
                    <div className="font-medium text-gray-900 text-sm">
                      {expandedCard.cardholder}
                    </div>
                  </div>
                </div>
                <div className="h-[1px] bg-gray-100" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Calendar size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Expires
                    </div>
                    <div className="font-medium text-gray-900 text-sm">
                      {expandedCard.expires || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                onClick={handleEditCard}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white rounded-2xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                
                  <Pencil size={16} />
                  Edit Card
                </button>
                <button
                onClick={handleDeleteCard}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white rounded-2xl shadow-sm text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Normal Wallet View */}
      <Header
        title="My Wallet"
        activeTab={activeTab}
        onNavigate={onNavigate}
        leftAction={addButton} />
      

      <div className="px-6 mt-8 flex-1 relative">
        <div className="relative h-[360px]">
          <AnimatePresence mode="popLayout">
            {cards.map((card, index) => {
              const yOffset = index * 40;
              const scale = 1 - index * 0.05;
              const zIndex = cards.length - index;
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 50
                  }}
                  animate={{
                    opacity: 1 - index * 0.15,
                    y: yOffset,
                    scale,
                    zIndex
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    y: -50
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8
                  }}
                  className="absolute top-0 left-0 w-full origin-top">
                  
                  <CreditCard
                    type={card.type}
                    cardholder={card.cardholder}
                    last4={card.last4}
                    expires={card.expires}
                    onClick={() => handleCardClick(card.id, index)}
                    className={index === 0 ? 'shadow-2xl' : 'shadow-md'} />
                  
                </motion.div>);

            })}
          </AnimatePresence>

          {cards.length === 0 &&
          <div className="h-[220px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-medium">
              No cards yet
            </div>
          }
        </div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isModalOpen && <AddCardModal onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>

      {/* Edit Card Modal */}
      <AnimatePresence>
        {isEditModalOpen && expandedCard &&
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 rounded-[2.5rem] overflow-hidden">
            <motion.div
            initial={{
              y: '100%'
            }}
            animate={{
              y: 0
            }}
            exit={{
              y: '100%'
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200
            }}
            className="w-full bg-white rounded-t-3xl p-6 pb-16 shadow-2xl">
            
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Card</h2>
                <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Card Number
                  </label>
                  <input
                  type="text"
                  defaultValue={`**** **** **** ${expandedCard.last4}`}
                  disabled
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none font-medium text-gray-400" />
                
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Cardholder Name
                  </label>
                  <input
                  type="text"
                  defaultValue={expandedCard.cardholder}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 font-medium" />
                
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Expiry Date
                    </label>
                    <input
                    type="text"
                    defaultValue={expandedCard.expires || ''}
                    placeholder="MM/YY"
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 font-medium" />
                  
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      CVV
                    </label>
                    <input
                    type="text"
                    placeholder="***"
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 font-medium" />
                  
                  </div>
                </div>
                <button
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold mt-4 hover:bg-gray-800 transition-colors"
                onClick={() => setIsEditModalOpen(false)}>
                
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}