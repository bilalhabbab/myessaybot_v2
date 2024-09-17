import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, discordProvider } from '../firebase'; 

const Signup = () => {
  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log('Signed up with Google');
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleDiscordSignup = async () => {
    try {
      await signInWithPopup(auth, discordProvider);
      console.log('Signed up with Discord');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <button onClick={handleGoogleSignup}>Sign Up with Google</button>
      <button onClick={handleDiscordSignup}>Sign Up with Discord</button>
    </div>
  );
};

export default Signup;
