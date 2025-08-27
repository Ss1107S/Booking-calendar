import express from 'express';
import cors from 'cors';
import os from 'os';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // парсинг JSON

// ========== EVENTS ========== //
let EventsHandler = {
  eventList: [],

  addEvent(event) {
    this.eventList.push(event);
  },

  getAllEvents() {
    return this.eventList;
  }
};

// POST-запрос для сохранения события
app.post('/events', (req, res) => {
  const eventData = req.body;
  console.log("Event received:", eventData);

  if (!eventData.title || !eventData.datetime) {
    return res.status(400).json({ error: "Invalid event format" });
  }

  EventsHandler.addEvent(eventData);
  res.status(200).json({ message: "Event successfully saved" });
});

// GET-запрос для получения всех событий
app.get('/events', (req, res) => {
  res.json(EventsHandler.getAllEvents());
});

// Тестовый эндпоинт
app.get('/api/test', (req, res) => {
  res.send('Test successful');
});

// Запуск сервера
const interfaces = os.networkInterfaces();
let localIP = 'localhost';

for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      localIP = iface.address;
      break;
    }
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening at http://${localIP}:${PORT}`);
});