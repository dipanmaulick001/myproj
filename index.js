const express = require('express'); 
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();

const JWT_SECRET = "ramdomharkiratilovekiara";
app.use(express.json());

const users = [];

// Serve frontend
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Signup route
app.post("/signup", (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    console.log("Users:", users);
    res.json({ message: "Signed up successfully" });
});

// Signin route
app.post("/signin", (req, res) => {
    const { username, password } = req.body;

    const foundUser = users.find(u => u.username === username && u.password === password);

    if (!foundUser) {
        return res.status(403).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

// Auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.token;
    console.log("Incoming token:", token);

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.username = decoded.username;
        next();
    } catch (e) {
        console.error("JWT verification failed:", e.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

// /me route
app.get("/me", authMiddleware, (req, res) => {
    const foundUser = users.find(u => u.username === req.username);

    if (!foundUser) {
        return res.status(404).json({ message: "User not found" });
    }

    // Only send username, not password
    res.json({ username: foundUser.username });
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});
