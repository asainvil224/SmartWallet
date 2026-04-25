import React, { useEffect, useState, useRef, Fragment } from 'react';
import { MoreVertical, CreditCard, Wallet, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface HeaderProps {
  title: string;
  activeTab: string;
  onNavigate: (tab: string) => void;
  leftAction?: React.ReactNode;
}
const navItems = [
{
  id: 'payment',
  label: 'Make a Payment',
  icon: CreditCard
},
{
  id: 'wallet',
  label: 'My Wallet',
  icon: Wallet
},
{
  id: 'history',
  label: 'Transaction History',
  icon: Clock
},
{
  id: 'profile',
  label: 'My Profile',
  icon: User
}];

export function Header({
  title,
  activeTab,
  onNavigate,
  leftAction
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative flex items-center justify-center px-6 py-4 pt-12">
      {leftAction && <div className="absolute left-6 top-12">{leftAction}</div>}
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <div className="absolute right-6 top-12" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 bg-[#4A4A4A] rounded-full flex items-center justify-center text-white shadow-sm">
          
          <MoreVertical size={18} />
        </button>

        <AnimatePresence>
          {isOpen &&
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: -8
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: -8
            }}
            transition={{
              duration: 0.15
            }}
            className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
            
              {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Fragment key={item.id}>
                    {index > 0 &&
                  <div className="h-[1px] bg-gray-100 w-full" />
                  }
                    <button
                    onClick={() => {
                      onNavigate(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${isActive ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                    
                      <Icon size={16} />
                      {item.label}
                    </button>
                  </Fragment>);

            })}
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}