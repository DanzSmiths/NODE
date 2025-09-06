const express = require('express');
const Fuse = require('fuse.js');

const app = express();
const PORT = 3000;

app.use(express.json());

// 🧍 Mock User Data
let users = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Smith", email: "bob@example.com" },
    { id: 3, name: "Charlie Williams", email: "charlie@example.com" },
];

// 🔎 Setup Fuse.js for fuzzy search
const fuse = new Fuse(users, {
    keys: ['name', 'email'],
    includeScore: true,
    threshold: 0.4 // Lower = stricter match
});

// 📁 Routes

// 1. Get all users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// 2. Get a user by ID
app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

// 3. Add a new user
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Missing name or email" });

    const newUser = {
        id: users.length + 1,
        name,
        email
    };
    users.push(newUser);
    fuse.setCollection(users); // Update fuzzy search index
    res.status(201).json(newUser);
});

// 4. Update user
app.put('/api/users/:id', (req, res) => {
    const { name, email } = req.body;
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

    fuse.setCollection(users); // Update fuzzy search index
    res.json(user);
});

// 5. Delete user
app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    users = users.filter(u => u.id !== id);
    fuse.setCollection(users); // Update fuzzy search index
    res.sendStatus(204);
});

// 6. 🔍 Fuzzy Search Users
app.get('/api/search', (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });

    const result = fuse.search(query);
    res.json(result.map(r => r.item));
});

// 🟢 Start Server
app.listen(PORT, () => {
    console.log(`API is running at http://localhost:${PORT}`);
});
