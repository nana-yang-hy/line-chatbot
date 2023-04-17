const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Set up body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up webhook endpoint
app.post("/webhook", (req, res) => {
  // Handle webhook event
  console.log(req.body);
  res.status(200).send();
});

// Start the server
app.listen(8000, () => {
  console.log("Webhook server started on port 8000");
});
