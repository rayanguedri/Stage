// PaymentForm.tsx

import React, { useState } from 'react';
import { Typography, Grid, TextField, Button } from '@mui/material';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js';
import { StripeInput } from './StripeInput';
import { StripeElementType } from '@stripe/stripe-js';
import agent from '../../../app/api/agent';

interface Props {
    activityId: string | undefined;
    cardState: { elementError: { [key in StripeElementType]?: string } };
    onPayment: () => void;
    onCardInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaymentForm: React.FC<Props> = ({ activityId, cardState, onPayment, onCardInputChange }) => {
    const [formData, setFormData] = useState({
        nameOnCard: '',
        cardNumber: '',
        expDate: '',
        cvv: ''
    });

    // Handle input change for form fields
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
        onCardInputChange(event); // Pass the input change event to parent
    };

    // Handle payment
    const handlePayment = async () => {
        console.log('Payment initiated');
        
        if (activityId) {
            try {
                // Create payment intent
                const paymentIntentResponse = await agent.Payments.createPaymentIntent();
                console.log('Payment Intent Response:', paymentIntentResponse);

                // Handle response accordingly
            } catch (error) {
                console.error('Error:', error);
                // Handle error accordingly
            }
        }
      
        if (onPayment) {
            onPayment(); 
        }
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>
                Payment method
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        name='nameOnCard'
                        label='Name on card'
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        value={formData.nameOnCard}
                        onChange={handleInputChange}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        error={!!cardState.elementError.cardNumber}
                        helperText={cardState.elementError.cardNumber}
                        id="cardNumber"
                        name="cardNumber"
                        label="Card number"
                        fullWidth
                        autoComplete="cc-number"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        InputProps={{
                            inputComponent: StripeInput,
                            inputProps: {
                                component: CardNumberElement
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        error={!!cardState.elementError.cardExpiry}
                        helperText={cardState.elementError.cardExpiry}
                        id="expDate"
                        name="expDate"
                        label="Expiry date"
                        fullWidth
                        autoComplete="cc-exp"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        value={formData.expDate}
                        onChange={handleInputChange}
                        InputProps={{
                            inputComponent: StripeInput,
                            inputProps: {
                                component: CardExpiryElement
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        error={!!cardState.elementError.cardCvc}
                        helperText={cardState.elementError.cardCvc}
                        id="cvv"
                        name="cvv"
                        label="CVV"
                        fullWidth
                        autoComplete="cc-csc"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        value={formData.cvv}
                        onChange={handleInputChange}
                        InputProps={{
                            inputComponent: StripeInput,
                            inputProps: {
                                component: CardCvcElement
                            }
                        }}
                    />
                </Grid>
            </Grid>
            <Button variant="contained" color="primary" onClick={handlePayment}>
                Make Payment
            </Button>
        </>
    );
}

export default PaymentForm;
