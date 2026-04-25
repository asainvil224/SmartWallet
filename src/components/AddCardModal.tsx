import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
export function AddCardModal({ onClose }: {onClose: () => void;}) {
  return (
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
        className="w-full bg-white rounded-t-3xl p-6 pb-24 shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Card</h2>
          <button
            onClick={onClose}
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
              placeholder="0000 0000 0000 0000"
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 font-medium" />
            
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 font-medium" />
              
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 font-medium" />
              
            </div>
          </div>
          <button
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold mt-6 hover:bg-gray-800 transition-colors"
            onClick={onClose}>
            
            Add Card
          </button>
        </div>
      </motion.div>
    </div>);

}