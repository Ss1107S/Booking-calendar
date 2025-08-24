const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (optional)
let storedEventList = [];

// Route to receive event data
app.post('/events', (req, res) => {
  const incomingEventData = req.body;
  console.log("📩 Event received:", incomingEventData);

  storedEventList.push(incomingEventData); // Optional storage for testing

  res.status(200).json({ message: "Event successfully saved" });
});

// Simple check route
app.get('/', (req, res) => {
  res.send('🟢 Event server is running.');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


