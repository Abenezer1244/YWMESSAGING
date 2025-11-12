interface StripePaymentFormProps {
    amount: number;
    phoneNumber: string;
    paymentIntentId: string;
    onSuccess: (paymentMethodId: string) => void;
    onError?: (error: string) => void;
    isLoading?: boolean;
}
export default function StripePaymentForm({ amount, phoneNumber, paymentIntentId, onSuccess, onError, isLoading, }: StripePaymentFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StripePaymentForm.d.ts.map