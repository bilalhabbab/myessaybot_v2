// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwemvu41t5Zsu3_Y6yBShFy6KinxRWlO0",
    authDomain: "myessaybot-97e30.firebaseapp.com",
    projectId: "myessaybot-97e30",
    storageBucket: "myessaybot-97e30.appspot.com",
    messagingSenderId: "1078593539647",
    appId: "1:1078593539647:web:2191a38c905432364fb28a"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set up Google provider
const googleProvider = new GoogleAuthProvider();

// Function to handle Google Sign-In
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user; // User signed in successfully
  } catch (error) {
    console.error(error);
    throw error; // Handle error as needed
  }
};

// Function to handle sign out
const handleSignOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { auth, signInWithGoogle, handleSignOut };
