const express = require("express");
const session = require("express-session");
const path = require("path");
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'inventory',
  password: 'kishor123'
});

// Login route
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Handle login form submission
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // Authenticate user (check credentials against database)
  const q = "SELECT * FROM users WHERE username = ? AND password = ?";
  connection.query(q, [username, password], (err, results) => {
    if (err || results.length === 0) {
      res.render("login.ejs", { error: "Invalid username or password" });
    } else {
      // Set session
      req.session.authenticated = true;
      req.session.username = username;
      // Redirect to user data route
      res.redirect("/userdata");
    }
  });
});

// Middleware to protect routes requiring authentication
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  } else {
    res.redirect("/login");
  }
}

// Route to display user data (requires authentication)
app.get("/userdata", requireAuth, (req, res) => {
  const username = req.session.username;
  const q = "SELECT * FROM users WHERE username = ?";
  connection.query(q, [username], (err, results) => {
    if (err || results.length === 0) {
      res.status(500).send("User data not found");
    } else {
      const userData = results[0]; // Assuming username is unique
      res.render("userdata.ejs", { userData });
    }
  });
});

app.listen("8080", () => {
  console.log("Server is listening on port 8080");
});
