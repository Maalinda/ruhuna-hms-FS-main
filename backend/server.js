import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Function to format the private key
const formatPrivateKey = (key) => {
  return key.replace(/\\n/g, '\n');
};

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  }),
});

const db = getFirestore();

// Input validation middleware
const validateInput = (req, res, next) => {
  const { fullName, email, phoneNumber, password, confirmPassword } = req.body;

  if (req.path === '/register') {
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
  }

  if (req.path === '/login') {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
};

// Register route
app.post('/register', validateInput, async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    // Check if user already exists
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (doc.exists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    await userRef.set({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
app.post('/login', validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = doc.data();

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        fullName: userData.fullName,
        email: userData.email,
        username: userData.fullName.split(' ')[0] // Add username (first name)
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log("Server started successfully :)");

