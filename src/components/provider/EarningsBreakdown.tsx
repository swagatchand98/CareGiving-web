import React from 'react';

interface EarningsBreakdownProps {
  totalAmount: number;
  platformFee: number;
  taxAmount: number;
  stripeFee: number;
  providerAmount: number;
}

const EarningsBreakdown: React.FC<EarningsBreakdownProps> = ({
  totalAmount,
  platformFee,
  taxAmount,
  stripeFee,
  providerAmount
}) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-3">Payment Breakdown</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Payment</span>
          <span className="font-medium">${totalAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Platform Fee</span>
          <span className="text-red-600">-${platformFee.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="text-red-600">-${taxAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Stripe Processing Fee</span>
          <span className="text-red-600">-${stripeFee.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-2 mt-2 flex justify-between">
          <span className="font-medium">Your Earnings</span>
          <span className="font-medium text-green-600">${providerAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default EarningsBreakdown;
