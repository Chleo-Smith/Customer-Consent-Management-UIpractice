const jsonServer = require("json-server");
const path = require("path");
const server = jsonServer.create();

// Update this path to match your project structure
const dbPath = path.join(__dirname, "mock-api", "db.json");
const router = jsonServer.router(dbPath);

const middlewares = jsonServer.defaults({
  static: path.join(__dirname, "build"),
});
const customMiddleware = require("./mock-api/middleware");

// Get the lowdb instance from the router
const db = router.db;

// Make the database available to all middleware/routes
server.use((req, res, next) => {
  req.app.db = db;
  next();
});

// Important: body parser must come before custom middleware
server.use(jsonServer.bodyParser);
server.use(middlewares);
server.use(customMiddleware);
server.use(router);

// Serve React app for all other routes (client-side routing)
// This must come AFTER all API routes
server.get("*", (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith("/api")) {
    return next();
  }

  // Serve index.html for all other routes (React Router support)
  const indexPath = path.join(__dirname, "build", "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Error loading application");
    }
  });
});

// Use environment PORT or default to 3001
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Database loaded from: ${dbPath}`);
  console.log(`Serving static files from: ${path.join(__dirname, "build")}`);

  // Log what's in the database for debugging
  try {
    const customers = db.get("customers").value();
    const consents = db.get("consents").value();
    console.log(`Loaded ${customers?.length || 0} customers`);
    console.log(`Loaded ${consents?.length || 0} consent records`);
  } catch (error) {
    console.error("Error reading database:", error.message);
  }
});
