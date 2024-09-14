// // OPENAI
// Import the necessary modules and libraries
import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from "./config/db.js";
import fetch from 'node-fetch';
import OpenAI from 'openai';

dotenv.config(); // Load environment variables

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to the database
connectDB();

// Home page route
app.get('/', (req, res) => {
  res.send('Welcome to the home page!');
});

// Essay Generation Route
app.post('/generate-essay', async (req, res) => {
  const { prompt, numParagraphs, wordCount } = req.body;

  try {
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    // Estimate tokens based on word count (rough approximation)
    const tokenEstimate = Math.min(Math.floor(wordCount * 1.33), 4000);

    // Call OpenAI's Chat Completions API (using gpt-4o-mini or gpt-4o)
    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // You can change this to "gpt-4o" for more power
      messages: [
        { role: 'system', content: 'You are a helpful assistant that writes detailed and comprehensive essays.' },
        { role: 'user', content: `Write a detailed ${numParagraphs}-paragraph essay on '${prompt}' with at least ${wordCount} words.` }
      ],
      max_tokens: tokenEstimate,
      temperature: 0.7, // Adjust for creativity if needed
    });

    // Extracting the essay from the response
    if (openAIResponse.choices && openAIResponse.choices.length > 0) {
      const essay = openAIResponse.choices[0].message.content.trim();
      res.json({ result: essay });
    } else {
      throw new Error("No response from OpenAI");
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: 'Error generating essay', error: error.message });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server started at http://localhost:5000');
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



