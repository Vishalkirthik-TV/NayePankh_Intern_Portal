const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config(); // Load environment variables from .env file
connectDB(); // Connect to MongoDB

const app = express();

// Define allowed origins (update with your actual Vercel frontend URLs)
const allowedOrigins = [
  'https://naye-pankh-intern-portal.vercel.app',  // Main frontend
  'https://naye-pankh-intern-portal-ox93.vercel.app',  // Preview backend (if same)
  'http://localhost:3000'  // Local frontend dev
];

// Explicit preflight handler for OPTIONS (required for Vercel serverless)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    const originToAllow = allowedOrigins.includes(origin) ? origin : '*';
    res.header('Access-Control-Allow-Origin', originToAllow);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

// CORS middleware with dynamic origin check
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/donate", require("./routes/donateRoutes"));
app.use("/api/donations", require("./routes/donationsRoutes"));
app.use("/api/campaign", require("./routes/campaignRoutes"));

// Error handling middleware with CORS headers
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  const originToAllow = allowedOrigins.includes(origin) ? origin : '*';
  res.header('Access-Control-Allow-Origin', originToAllow);
  res.header('Access-Control-Allow-Credentials', 'true');
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.get("/", (req, res) => {
  res.send("Server is healthy");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
