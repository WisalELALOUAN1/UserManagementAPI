const express = require('express');
const app = express();

app.use(express.json());

// In-memory storage - users sorted by username
let users = [];
let nextId = 1;

// Helper function to keep users sorted by username
function insertUserSorted(user) {
  const index = users.findIndex(u => u.username.toLowerCase() > user.username.toLowerCase());
  if (index === -1) {
    users.push(user);
  } else {
    users.splice(index, 0, user);
  }
}

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Validation middleware
function validateUser(req, res, next) {
  const { username, age, email } = req.body;
  
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required and must be a non-empty string' });
  }
  
  if (age === undefined || typeof age !== 'number' || age < 18) {
    return res.status(400).json({ error: 'Age is required and must be at least 18' });
  }
  
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Valid email is required (format: name@domain.com)' });
  }
  
  next();
}

// Create a new user
app.post('/users', validateUser, (req, res) => {
  const { username, age, email } = req.body;
  
  // Check if username already exists
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  
  const user = {
    id: nextId++,
    username: username.trim(),
    age,
    email: email.trim()
  };
  
  insertUserSorted(user);
  res.status(201).json(user);
});

//  Get user by ID
app.get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// Get user by username
app.get('/users/username/:username', (req, res) => {
  const username = req.params.username;
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

//  Update user by ID
app.put('/users/:id', validateUser, (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { username, age, email } = req.body;
  
  // Check if new username conflicts with another user
  const existingUser = users.find(u => 
    u.username.toLowerCase() === username.toLowerCase() && u.id !== id
  );
  
  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  
  // Remove user from current position
  users.splice(index, 1);
  
  // Update user data
  const updatedUser = {
    id,
    username: username.trim(),
    age,
    email: email.trim()
  };
  
  // Re-insert in sorted position
  insertUserSorted(updatedUser);
  
  res.json(updatedUser);
});

// Delete user by ID
app.delete('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(index, 1);
  res.status(204).send();
});

//  Get all users (with optional age filter)
app.get('/users', (req, res) => {
  const { age } = req.query;
  
  if (age) {
    const ageNum = parseInt(age);
    
    if (isNaN(ageNum)) {
      return res.status(400).json({ error: 'Age filter must be a number' });
    }
    
    const filteredUsers = users.filter(u => u.age === ageNum);
    return res.json(filteredUsers);
  }
  
  res.json(users);
});

// For testing purposes
function resetUsers() {
  users = [];
  nextId = 1;
}

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, resetUsers };
