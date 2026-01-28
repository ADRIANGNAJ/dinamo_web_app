import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import Button from './Button';

interface StripePaymentFormProps {
    onSuccess: () => void;
    onError: (message: string) => void;
    amount: number;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ onSuccess, onError, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');
        onError('');

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/#/order-success/pending`, // We will intercept this manually or handle redirect logic
            },
            redirect: 'if_required', // Avoid redirect if not needed (e.g. card payment without 3DS)
        });

        if (error) {
            setErrorMessage(error.message || 'Error al procesar el pago');
            onError(error.message || 'Error al procesar el pago');
            setIsProcessing(false);
        } else {
            // Payment successful!
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                fullWidth
                disabled={!stripe || isProcessing}
                className="mt-4"
            >
                {isProcessing ? 'Procesando Pago...' : `Pagar $${amount}`}
            </Button>
        </form>
    );
};

export default StripePaymentForm;
