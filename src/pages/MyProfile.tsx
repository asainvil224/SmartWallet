import React from 'react';
import { Header } from '../components/Header';
interface MyProfileProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}
export function MyProfile({ activeTab, onNavigate }: MyProfileProps) {
  return (
    <div className="flex flex-col h-full bg-[#F2F3F5]">
      <Header
        title="My Profile"
        activeTab={activeTab}
        onNavigate={onNavigate} />
      

      <div className="px-6 mt-6 flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center shadow-sm mb-8">
          <div className="w-24 h-24 bg-[#5A5A5A] rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-inner">
            J
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Jason</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            hacker@gmail.com
          </p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-4 text-lg">
            Account Information
          </h3>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
                Email
              </div>
              <div className="font-medium text-gray-900">hacker@gmail.com</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
                Name
              </div>
              <div className="font-medium text-gray-900">Jason</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
                Phone
              </div>
              <div className="font-medium text-gray-900">+1 (555) 123-4567</div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}