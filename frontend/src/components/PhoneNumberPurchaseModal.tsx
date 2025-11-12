import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Loader, Check, ChevronDown } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import StripePaymentForm from './StripePaymentForm';
import { searchAvailableNumbers, setupPaymentIntent, confirmPayment, purchaseNumber, PhoneNumber } from '../api/numbers';

interface PhoneNumberPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: (phoneNumber: string) => void;
}

const US_STATES = [
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'IL', name: 'Illinois' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'OH', name: 'Ohio' },
  { code: 'GA', name: 'Georgia' },
  { code: 'MI', name: 'Michigan' },
  { code: 'NC', name: 'North Carolina' },
];

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function PhoneNumberPurchaseModal({
  isOpen,
  onClose,
  onPurchaseComplete,
}: PhoneNumberPurchaseModalProps) {
  const [step, setStep] = useState<'search' | 'select' | 'confirm' | 'payment'>('search');
  const [areaCode, setAreaCode] = useState('');
  const [state, setState] = useState('');
  const [searchResults, setSearchResults] = useState<PhoneNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'declined' | 'failed'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');

  const handleSearch = async () => {
    if (!areaCode && !state) {
      toast.error('Please enter an area code or select a state');
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchAvailableNumbers({
        areaCode: areaCode || undefined,
        state: state || undefined,
        quantity: 10,
      });

      if (results.length === 0) {
        toast.error('No numbers found for that search');
        setSearchResults([]);
      } else {
        setSearchResults(results);
        setStep('select');
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      toast.error(error.message || 'Failed to search numbers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectNumber = async (number: PhoneNumber) => {
    setSelectedNumber(number);
    setStep('confirm');
  };

  const handleConfirmSelection = async () => {
    if (!selectedNumber) return;

    setIsLoading(true);
    try {
      // Create payment intent for $4.99 setup fee
      const paymentResponse = await setupPaymentIntent(selectedNumber.phoneNumber);

      if (!paymentResponse.success || !paymentResponse.data?.paymentIntentId) {
        throw new Error('Failed to create payment intent');
      }

      setPaymentIntentId(paymentResponse.data.paymentIntentId);
      setStep('payment');
    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      toast.error(error.message || 'Failed to create payment intent');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    if (!selectedNumber || !paymentIntentId) return;

    setIsLoading(true);
    setPaymentStatus('processing');
    setPaymentMessage('');

    try {
      // Confirm payment with Stripe
      const paymentConfirm = await confirmPayment(
        paymentIntentId,
        paymentMethodId
      );

      if (!paymentConfirm.success || paymentConfirm.data?.status !== 'succeeded') {
        // Payment was declined or failed
        setPaymentStatus('failed');
        setPaymentMessage('Payment confirmation failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Payment succeeded - now purchase the number
      const result = await purchaseNumber(
        selectedNumber.phoneNumber,
        paymentIntentId
      );

      if (result.success) {
        setPaymentStatus('success');
        setPaymentMessage('');

        // Wait a moment to show success before closing
        setTimeout(() => {
          toast.success(`Successfully purchased ${selectedNumber.formattedNumber}!`);

          if (onPurchaseComplete) {
            onPurchaseComplete(selectedNumber.phoneNumber);
          }

          // Reset form
          resetForm();
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);

      // Extract error message from axios error or generic error
      let errorMsg = 'Payment processing failed';

      if (error.response?.status === 402) {
        errorMsg = error.response?.data?.error || 'Request failed with status code 402';
      } else if (error.message) {
        errorMsg = error.message;
      }

      // Determine if it's a decline or generic failure
      const isDecline = errorMsg.toLowerCase().includes('declined') ||
                       errorMsg.toLowerCase().includes('insufficient');

      setPaymentStatus(isDecline ? 'declined' : 'failed');
      setPaymentMessage(errorMsg);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('search');
    setAreaCode('');
    setState('');
    setSearchResults([]);
    setSelectedNumber(null);
    setPaymentIntentId(null);
    setPaymentStatus('idle');
    setPaymentMessage('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, type: 'tween' } as any,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-background border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/30 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Buy Phone Number
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {step === 'search' && 'Search available numbers'}
                    {step === 'select' && 'Choose a number'}
                    {step === 'confirm' && 'Confirm purchase'}
                    {step === 'payment' && 'Complete payment'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                disabled={isLoading}
                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Step 1: Search */}
                {step === 'search' && (
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Area Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 415, 212, 310"
                        value={areaCode}
                        onChange={(e) => setAreaCode(e.target.value)}
                        maxLength={3}
                        className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        State (Optional)
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background text-foreground focus:border-primary focus:outline-none transition-colors appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.5rem center',
                          paddingRight: '2rem',
                        }}
                      >
                        <option value="">Select a state...</option>
                        {US_STATES.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      onClick={handleSearch}
                      disabled={isLoading}
                      isLoading={isLoading}
                      className="bg-primary hover:bg-primary/90 text-background font-medium mt-6"
                    >
                      {isLoading ? 'Searching...' : 'Search Numbers'}
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Select */}
                {step === 'select' && (
                  <motion.div variants={itemVariants} className="space-y-3">
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {searchResults.map((number) => (
                        <motion.button
                          key={number.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleSelectNumber(number)}
                          className="w-full p-4 border-2 border-border/30 rounded-lg bg-muted/20 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-foreground text-lg">
                                {number.formattedNumber}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {number.region}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-foreground">
                                ${number.costPerSms.toFixed(4)}/SMS
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ${number.costPerMinute.toFixed(4)}/min
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <Button
                      variant="secondary"
                      fullWidth
                      size="sm"
                      onClick={() => {
                        setStep('search');
                        setSearchResults([]);
                        setSelectedNumber(null);
                      }}
                      className="mt-4"
                    >
                      Back to Search
                    </Button>
                  </motion.div>
                )}

                {/* Step 3: Confirm */}
                {step === 'confirm' && selectedNumber && (
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="text-center">
                        <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {selectedNumber.formattedNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedNumber.region}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 bg-muted/30 rounded-lg p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Per SMS:</span>
                        <span className="font-medium text-foreground">
                          ${selectedNumber.costPerSms.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Per minute:</span>
                        <span className="font-medium text-foreground">
                          ${selectedNumber.costPerMinute.toFixed(4)}
                        </span>
                      </div>
                      <div className="border-t border-border/30 pt-2 mt-2 flex justify-between font-semibold">
                        <span className="text-foreground">One-time setup:</span>
                        <span className="text-primary">$4.99</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      By purchasing, you agree to Telnyx's terms and will be charged the one-time setup fee. Usage charges apply separately.
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={handleConfirmSelection}
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="bg-primary hover:bg-primary/90 text-background font-medium"
                      >
                        {isLoading ? 'Processing...' : 'Continue to Payment'}
                      </Button>

                      <Button
                        variant="secondary"
                        fullWidth
                        size="sm"
                        onClick={() => {
                          setStep('select');
                          setSelectedNumber(null);
                        }}
                        disabled={isLoading}
                      >
                        Choose Different Number
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Payment */}
                {step === 'payment' && selectedNumber && paymentIntentId && (
                  <motion.div variants={itemVariants} className="space-y-4">
                    <Elements stripe={stripePromise}>
                      <StripePaymentForm
                        amount={499} // $4.99 in cents
                        phoneNumber={selectedNumber.phoneNumber}
                        paymentIntentId={paymentIntentId}
                        onSuccess={handlePaymentSuccess}
                        isLoading={isLoading}
                        paymentStatus={paymentStatus}
                        paymentMessage={paymentMessage}
                      />
                    </Elements>

                    <Button
                      variant="secondary"
                      fullWidth
                      size="sm"
                      onClick={() => {
                        setStep('confirm');
                        setPaymentStatus('idle');
                        setPaymentMessage('');
                      }}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
