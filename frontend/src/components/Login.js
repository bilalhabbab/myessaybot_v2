import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, discordProvider } from '../firebase'; 

const Login = () => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log('Logged in with Google');
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleDiscordLogin = async () => {
    try {
      await signInWithPopup(auth, discordProvider);
      console.log('Logged in with Discord');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <button onClick={handleDiscordLogin}>Login with Discord</button>
    </div>
  );
};

export default Login;
