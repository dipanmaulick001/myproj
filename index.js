const express = require('express');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "ramdomharkiratilovekiara"
const app = express();
app.use(express.json());

const users = [];
app.get("/" , function(req,res){
    res.sendFile(__dirname + "/public/index.html")
})

app.post("/signup", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    users.push({
        username: username,
        password: password
    })    

    res.json({
        message: "You are signed up"
    })

    console.log(users)
    
})

app.post("/signin", function(req, res) {
    
    const username = req.body.username;
    const password = req.body.password;

    // maps and filter
    let foundUser = null;

    for (let i = 0; i<users.length; i++) {
        if (users[i].username == username && users[i].password == password) {
            foundUser = users[i]
        }
    }

    if (foundUser) {
        const token = jwt.sign({
            username: username,
            password: password,
            
        }, JWT_SECRET) ;

        // foundUser.token = token;
        res.json({
            token: token
        })
    } else {
        res.status(403).send({
            message: "Invalid username or password"
        })
    }
    console.log(users)
})

function authMiddleware(req, res, next) {
    const token = req.headers.token;
    console.log("🔹 Incoming token:", token);  //  DEBUG 1

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("✅ Decoded token:", decoded);  //  DEBUG 2
        req.username = decoded.username;
        next();
    } catch (e) {
        console.error(" JWT verification failed:", e.message);  //  DEBUG 3
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

app.get("/me", authMiddleware, function (req, res) {
    console.log("Inside /me route, username:", req.username);  //  DEBUG 4

    const foundUser = users.find(u => u.username === req.username);
    if (foundUser) {
        res.json({
            username: foundUser.username,
            password: foundUser.password
        });
    } else {
        res.status(401).json({ message: "User not found" });
    }
});





app.listen(3001);// that the http server is listening on port 3001