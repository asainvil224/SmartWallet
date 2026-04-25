import React from 'react';
interface CreditCardProps {
  type: 'cent' | 'mastercard' | 'blue';
  cardholder: string;
  last4: string;
  expires?: string;
  className?: string;
  onClick?: () => void;
}
export function CreditCard({
  type,
  cardholder,
  last4,
  expires,
  className = '',
  onClick
}: CreditCardProps) {
  const getBgColor = () => {
    if (type === 'cent') return 'bg-[#5A5A5A]';
    if (type === 'mastercard') return 'bg-[#5A5A5A]';
    if (type === 'blue') return 'bg-[#1E4D8C]';
    return 'bg-gray-700';
  };
  return (
    <div
      onClick={onClick}
      className={`relative w-full h-[220px] rounded-2xl p-6 text-white overflow-hidden shadow-lg ${getBgColor()} ${onClick ? 'cursor-pointer' : ''} ${className}`}>
      
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-black/10 rounded-full" />

      <div className="relative h-full flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          {type === 'cent' &&
          <>
              <span className="text-[#39FF14] text-2xl font-bold">$</span>
              <span className="font-bold tracking-widest text-lg">CENT</span>
            </>
          }
          {type === 'mastercard' &&
          <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider">
                MASTERCARD
              </span>
              <span className="text-sm text-gray-300 font-medium mt-1">
                Standard
              </span>
            </div>
          }
          {type === 'blue' &&
          <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider">VISA</span>
              <span className="text-sm text-blue-200 font-medium mt-1">
                Platinum
              </span>
            </div>
          }
        </div>

        <div className="text-2xl tracking-[0.25em] font-medium mt-6">
          **** **** **** {last4}
        </div>

        <div className="flex justify-between items-end mt-4">
          <div>
            <div className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">
              Cardholder
            </div>
            <div className="font-medium text-sm">{cardholder}</div>
          </div>
          {expires &&
          <div className="text-right">
              <div className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">
                Expires
              </div>
              <div className="font-medium text-sm">{expires}</div>
            </div>
          }
        </div>
      </div>
    </div>);

}