// QueueSmart backend. Express serves the API under /api and the A2 front end as static files,
// so the pages can call fetch("/api/...") on the same origin.
const path = require("path");
const express = require("express");
const routes = require("./src/routes");

const app = express();
app.use(express.json());
app.use("/api", routes);
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Only start listening when run directly (node server.js). Tests import the app instead.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, function () {
    console.log("QueueSmart backend running at http://localhost:" + port);
  });
}

module.exports = app;
