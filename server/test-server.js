
const express = require("express");

const app = express();

app.get("/api/health", (req, res) => {
  console.log("Health route reached");
  res.status(200).send("API is responding!");
});

app.listen(5055, "127.0.0.1", () => {
  console.log("Test server listening at http://127.0.0.1:5055");
});