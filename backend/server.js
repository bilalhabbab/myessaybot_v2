import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from "./config/db.js";
import OpenAI from 'openai';
import Essay from './models/Essay.js';
import Stripe from 'stripe';

// Load environment variables
dotenv.config({ path: './.env' });
const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Correctly set the Cohere API key

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(express.json());  // To parse incoming JSON requests
app.use(cors());          // To enable CORS

// Connect to the database
connectDB();

// Function to call OpenAI's API
const generateWithOpenAI = async (prompt, numParagraphs, wordCount) => {
  const tokenEstimate = Math.min(Math.floor(wordCount * 1.33), 4000);
  const openAIResponse = await openai.chat.completions.create({
    model: "gpt-4",  // Adjust as necessary
    messages: [
      { role: 'system', content: 'You are a helpful assistant that writes detailed and comprehensive essays.' },
      { role: 'user', content: `Write an exactly, no more, no less, ${numParagraphs}-paragraph essay on '${prompt}' with at least ${wordCount} words.` }
    ],
    max_tokens: tokenEstimate,
    temperature: 0.7,
  });

  if (openAIResponse.choices && openAIResponse.choices.length > 0) {
    return openAIResponse.choices[0].message.content.trim();
  } else {
    throw new Error("No response from OpenAI");
  }
};


app.post('/save-essay', async (req, res) => {
  const { content, user } = req.body;

  // Basic validation
  if (!content || !user) {
    return res.status(400).json({ message: 'Content and user are required' });
  }

  try {
    const newEssay = new Essay({ content, user });
    await newEssay.save();
    res.status(201).json({ message: 'Essay saved successfully' });
  } catch (error) {
    console.error('Error saving essay:', error.message);
    res.status(500).json({ message: 'Failed to save essay', error: error.message });
  }
});


// Stripe checkout session creation route
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1PxZ0zBHuck2IHyain2XeshW',  // Replace with your actual Stripe price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',  // If it's a subscription, use 'subscription', otherwise 'payment'
      success_url: 'http://localhost:3000/success',  // Replace with your actual success URL
      cancel_url: 'http://localhost:3000/cancel',    // Replace with your actual cancel URL
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});



// Fetch all essays route
app.get('/all-essays', async (req, res) => {
  try {
    const essays = await Essay.find();  // Fetch all essays from the database
    res.json({ essays });
  } catch (error) {
    console.error('Error fetching essays:', error.message);
    res.status(500).json({ message: 'Failed to fetch essays' });
  }
});

// Function to call Cohere's API using the chat method
const generateWithCohere = async (prompt, numParagraphs, wordCount) => {
  const response = await cohere.generate({
    model: 'command-xlarge-nightly',
    prompt: `Write a ${numParagraphs}-paragraph essay with at least ${wordCount} words on the topic: ${prompt}`,
    max_tokens: Math.min(Math.floor(wordCount * 1.33), 3000),
    temperature: 0.7,
  });

  if (response.body.generations && response.body.generations.length > 0) {
    return response.body.generations[0].text.trim();
  } else {
    throw new Error("No response from Cohere");
  }
};


const handleSubscribe = async () => {
  setIsLoading(true);
  const stripe = await stripePromise;
  
  try {
    // Fetch the session ID from the backend
    const response = await fetch('http://localhost:5000/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const session = await response.json();

    // Ensure the session ID is returned from the backend
    if (session.id) {
      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        console.error(result.error.message);
      }
    } else {
      console.error("No session ID returned from backend.");
    }

  } catch (error) {
    console.error("Error creating checkout session:", error);
  } finally {
    setIsLoading(false);
  }
};


// Essay Generation Route with model toggle between OpenAI and Cohere
app.post('/generate-essay', async (req, res) => {
  const { prompt, numParagraphs, wordCount } = req.body;

  // Basic validation
  if (!prompt || !numParagraphs || !wordCount) {
    return res.status(400).json({ message: "Prompt, numParagraphs, and wordCount are required" });
  }

  try {
    let essay = await generateWithOpenAI(prompt, numParagraphs, wordCount);  // Or any other logic

    res.json({ result: essay });
  } catch (error) {
    res.status(500).json({ message: 'Error generating essay', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});


// // OPENAI & STEALTHGPT
// // Import the necessary modules and libraries
// import express from "express";
// import dotenv from "dotenv";
// import cors from 'cors';
// import { connectDB } from "./config/db.js";
// import Product from "./models/product.model.js";
// import Stripe from 'stripe';
// import fetch from 'node-fetch'; // Import only once
// import OpenAI from 'openai';  // Correct import for newer versions of the openai package

// dotenv.config(); // Load env variables

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,  // Ensure the OpenAI API key is in your .env file
// });

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Stripe secret key
// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Connect to the database
// connectDB();

// // Home page route
// app.get('/', (req, res) => {
//   res.send('Welcome to the home page!');
// });

// // Products route
// app.get('/products', async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching products' });
//   }
// });

// // Stripe checkout session
// app.post('/create-checkout-session', async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: 'price_1PxZ0zBHuck2IHyain2XeshW', // Stripe price ID
//           quantity: 1,
//         },
//       ],
//       mode: 'subscription',
//       success_url: 'http://localhost:3000/success',
//       cancel_url: 'http://localhost:3000/cancel',
//     });
//     res.json({ id: session.id });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post('/generate-essay', async (req, res) => {
//   const { prompt, numParagraphs, wordCount } = req.body;

//   try {
//     if (!prompt) {
//       throw new Error("Prompt is required");
//     }

//     // Generate the essay using OpenAI (ChatGPT)
//     const openAIResponse = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: 'user', content: `Write an exactly ${numParagraphs}-paragraph essay on what someone describes as '${prompt}'. Ensure the minimum Word count to be ${wordCount}` }
//       ]
//     });

//     if (openAIResponse.choices && openAIResponse.choices.length > 0) {
//       const essay = openAIResponse.choices[0].message.content;

//       // Send the generated essay to StealthGPT for transformation
//       const stealthGPTResponse = await fetch('https://stealthgpt.ai/api/stealthify', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'api-token': process.env.STEALTHGPT_API_KEY, // Your StealthGPT API key
//         },
//         body: JSON.stringify({
//           prompt: essay,  // Use 'prompt' instead of 'text' as StealthGPT expects 'prompt'
//           rephrase: true, 
//           tone: "Academic", 
//           mode: "Medium", 
//         }),
//       });

//       const transformedEssay = await stealthGPTResponse.json();
//       res.json({ transformedEssay });
//     } else {
//       throw new Error("No response from OpenAI");
//     }
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ message: 'Error generating or transforming the essay', error: error.message });
//   }
// });



// // Start the server
// app.listen(5000, () => {
//   console.log('Server started at http://localhost:5000');
// });





// // STEALTHGPT
// // Import the necessary modules and libraries
// import express from "express";
// import dotenv from "dotenv";
// import cors from 'cors';
// import fetch from 'node-fetch'; // Import for making API calls

// dotenv.config(); // Load env variables

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Home page route
// app.get('/', (req, res) => {
//   res.send('Welcome to the home page!');
// });

// // Use StealthGPT API for essay generation
// app.post('/generate-essay', async (req, res) => {
//   const { prompt, numParagraphs, wordCount } = req.body;

//   try {
//     if (!prompt || typeof prompt !== 'string') {
//       throw new Error("Prompt is required and must be a string.");
//     }

//     const tone = 'Academic';  // Optional, change based on need
//     const mode = 'High';      // Optional, change based on need
//     const business = true;   // Optional, toggle for business mode

//     // Modify the prompt to be more explicit about the word count and number of paragraphs
//     const modifiedPrompt = `${prompt}. Write an essay with ${numParagraphs} paragraphs and a minimum of ${wordCount} words.`;

//     const stealthGPTResponse = await fetch('https://stealthgpt.ai/api/stealthify', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'api-token': process.env.STEALTHGPT_API_KEY,
//       },
//       body: JSON.stringify({
//         prompt: modifiedPrompt,  // Send the modified prompt to API
//         rephrase: false,
//         tone: tone,
//         mode: mode,
//         business: business,
//       }),
//     });

//     const data = await stealthGPTResponse.json();

//     if (data.result) {
//       res.json({ result: data.result });
//     } else {
//       console.error('Unexpected API response structure:', data);
//       res.status(500).json({ message: 'Unexpected API response structure', response: data });
//     }
//   } catch (error) {
//     console.error("Error generating essay:", error.message);
//     res.status(500).json({ message: 'Error generating essay', error: error.message });
//   }
// });

// // Start the server
// app.listen(5000, () => {
//   console.log('Server started at http://localhost:5000');
// });



