// app.js
const express = require("express");
const session = require("express-session");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// In-memory arrays for users and events
const users = [];
let events = [];

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

// Route: User Registration
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const userExists = users.find((u) => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);
  res.json({ message: "User registered successfully" });
});

// Route: User Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.session.user = user;
    res.json({ message: "Logged in successfully" });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

// Route: Create Event
app.post("/events", isAuthenticated, (req, res) => {
  const { name, description, date, time, category, reminderMinutesBefore } =
    req.body;
  const userId = req.session.user.id;
  const eventId = events.length + 1;
  const eventDateTime = new Date(`${date}T${time}`);
  const newEvent = {
    id: eventId,
    userId,
    name,
    description,
    date: eventDateTime,
    category,
    reminderMinutesBefore,
    reminderNotified: false,
  };
  events.push(newEvent);

  // Schedule a reminder if reminderMinutesBefore is provided
  if (reminderMinutesBefore && !isNaN(reminderMinutesBefore)) {
    const reminderTime = new Date(
      eventDateTime.getTime() - reminderMinutesBefore * 60000
    );
    const delay = reminderTime.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        console.log(
          `Reminder: Event "${name}" is starting at ${eventDateTime}`
        );
        newEvent.reminderNotified = true;
      }, delay);
    }
  }
  res.json({ message: "Event created successfully", event: newEvent });
});

// Route: View Events (with optional sorting)
app.get("/events", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  let userEvents = events.filter((e) => e.userId === userId);
  const { sortBy } = req.query;
  if (sortBy) {
    if (sortBy === "date") {
      userEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "category") {
      userEvents.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === "reminder") {
      userEvents.sort((a, b) => a.reminderNotified - b.reminderNotified);
    }
  }
  res.json(userEvents);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
