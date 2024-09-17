import React, { useState } from 'react';

// Load Stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('pk_live_51PxXPWBHuck2IHyao6VB4vrE2TdblEzqeBhmOnVaDzwtdlEb9aTY156i3wOUgtqhO4gYYglZ2FcXixePX5zU94nb00i81AK9Jq'); // Replace with your actual public key

const SubscribeButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);

    // Load Stripe.js instance
    const stripe = await stripePromise;

    try {
      // Create a checkout session on your server
      const response = await fetch('http://localhost:5000/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const session = await response.json();

      // Redirect to checkout
      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        console.error(result.error.message);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      style={{
        backgroundColor: isLoading ? 'gray' : '#6772E5',
        color: 'white',
        padding: '10px 20px',
        fontSize: '16px',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      {isLoading ? 'Loading...' : 'Subscribe to Premium'}
    </button>
  );
};

export default SubscribeButton;
