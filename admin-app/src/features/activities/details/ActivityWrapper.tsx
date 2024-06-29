import React, { useState, useEffect } from 'react';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { observer } from 'mobx-react-lite';
import LoadingComponent from "../../../app/layout/LoadingComponent";
import PaymentForm from "./PaymentForm";
import { useParams } from "react-router-dom";
import agent from "../../../app/api/agent";

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51PLpOJEWVw1xAHG0Zz5XGWA6BDOk4ndH1EVWhDE4HduJHwkc7ERxwhfsDMO50sdK5DO3NQH40e5mFhV4dM1d4z20009Uy9Fkix');

const ActivityWrapper: React.FC = () => {
    const { activityId: routeActivityId } = useParams<{ activityId: string }>();
    const [loading, setLoading] = useState(true);
    const [cardState, setCardState] = useState<{ elementError: { [key: string]: string } }>({
        elementError: {
            cardNumber: '',
            cardExpiry: '',
            cardCvc: ''
        }
    });

    // Handle input change for card details
    const handleCardInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setCardState(prevState => ({
            elementError: {
                ...prevState.elementError,
                [name]: value
            }
        }));
    };

    // Handle payment logic
    const handlePayment = async () => {
        if (!routeActivityId) return; // Return if no activity ID
        
        // Handle payment logic
        console.log('Payment initiated');

        try {
            // Create payment intent
            const paymentIntentResponse = await agent.Payments.createPaymentIntent();
            console.log('Payment Intent Response:', paymentIntentResponse);

            // Handle response accordingly
        } catch (error) {
            console.error('Error:', error);
            // Handle error accordingly
        }
    };

    // Load activity data or any other necessary initialization
    useEffect(() => {
        setLoading(true);
        // Load activity data or any other necessary initialization
        setLoading(false);
    }, [routeActivityId]);

    // Render loading component while loading
    if (loading) return <LoadingComponent/>;

    // Render payment form
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm 
                activityId={routeActivityId} 
                cardState={cardState} 
                onPayment={handlePayment} 
                onCardInputChange={handleCardInputChange} 
            />
        </Elements>
    );
}

export default observer(ActivityWrapper);
