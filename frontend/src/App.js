import React, { useEffect, useState } from 'react';
import './App.css';
import { auth, signOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import Signup from './components/Signup';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Generator from './components/Generator';
import logo from './myessaybotpfp.png'; // Importing the logo

// Initialize Stripe
const stripePromise = loadStripe('pk_live_51PxXPWBHuck2IHyao6VB4vrE2TdblEzqeBhmOnVaDzwtdlEb9aTY156i3wOUgtqhO4gYYglZ2FcXixePX5zU94nb00i81AK9Jq');

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('openai'); // Default to OpenAI
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("Signed out successfully");
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    const stripe = await stripePromise;
    try {
      const response = await fetch('http://localhost:5000/create-checkout-session', {
        method: 'POST'
      });
      const session = await response.json();
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

  const handleGenerator = () => {
    // Pass the selected model as a state parameter to the generator route
    navigate('/generator', { state: { model } });
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <img src={logo} alt="myessaybotlogo" className="logo" />
          <div className="text-content">
            <h1>Welcome to The Essay Bot</h1>
            {user ? (
              <div>
                <h2>Welcome, {user.displayName?.split(' ')[0]}</h2>
                <button onClick={handleSignOut} className='sign-out'>Sign Out</button>
                <button onClick={handleSubscribe} className='subscribe' disabled={isLoading}>
                  {isLoading ? "Loading..." : "Subscribe to EssayBot Premium"}
                </button>
                
                {/* Add the model selection dropdown */}

                <button onClick={handleGenerator} className='continue-generator'>Continue to Generator</button>
              </div>
            ) : (
              <>
                <Login />
                <Signup />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Define Routes */}
      <Routes>
        <Route
          path="/generator"
          element={user ? <Generator /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} /> {/* Redirect all other routes */}
      </Routes>
    </div>
  );
}

export default App;