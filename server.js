const express = require("express");

// Load environment variables from .env file
require("dotenv").config();

// Create Express app
const app = express();

// Cors
const cors = require("cors");
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Path
const path = require("path");

// Serve Static Resources
app.use("/public", express.static("public"));
// app.use(express.static(path.join(__dirname, "public")));

// Connect to the database
const connectDB = require("./config/database");
connectDB();

// Routes
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes); // API Route

app.use((req, res, next) => {
  res.status(404).render("404", {
    layout: false,
    title: "Page Not Found",
  });
}); // 404 Route

// Server listen
var PORT = process.env.APP_PORT || 5000;
app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Express server started at http://localhost:${PORT}`);
});
