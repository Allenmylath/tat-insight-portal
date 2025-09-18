import { useState } from 'react';
import { CreditBalance } from '@/components/CreditBalance';
import { CreditPurchaseModal } from '@/components/CreditPurchaseModal';

export const CreditHeader = () => {
  const [showCreditModal, setShowCreditModal] = useState(false);

  return (
    <>
      <CreditBalance 
        onPurchaseClick={() => setShowCreditModal(true)}
        showPurchaseButton={true}
      />
      <CreditPurchaseModal 
        open={showCreditModal} 
        onOpenChange={setShowCreditModal} 
      />
    </>
  );
};