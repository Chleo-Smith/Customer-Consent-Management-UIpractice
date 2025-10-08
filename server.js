// // const jsonServer = require("json-server");
// // const server = jsonServer.create();
// // const router = jsonServer.router("mock-api/db.json");
// // const middlewares = jsonServer.defaults();
// // const customMiddleware = require("./mock-api/middleware");

// // // Important: body parser must come before custom middleware
// // server.use(jsonServer.bodyParser);
// // server.use(middlewares);
// // server.use(customMiddleware);
// // server.use(router);

// // const PORT = 3001;
// // server.listen(PORT, () => {
// //   console.log(`ver is running on http://localhost:${PORT}`);
// // });

// const jsonServer = require("json-server");
// const path = require("path");
// const server = jsonServer.create();
// const router = jsonServer.router(path.join(__dirname, "mock-api", "db.json"));
// const middlewares = jsonServer.defaults();
// const customMiddleware = require("./mock-api/middleware");

// // Get the lowdb instance from the router
// const db = router.db;

// // Make the database available to all middleware/routes
// server.use((req, res, next) => {
//   req.app.db = db;
//   next();
// });

// // Important: body parser must come before custom middleware
// server.use(jsonServer.bodyParser);
// server.use(middlewares);
// server.use(customMiddleware);
// server.use(router);

// const PORT = 3001;
// server.listen(PORT, () => {
//   console.log(`JSON Server is running on http://localhost:${PORT}`);
//   console.log(
//     `Database loaded from: ${path.join(__dirname, "mock-api", "db.json")}`
//   );

//   // Log what's in the database for debugging
//   const customers = db.get("customers").value();
//   const consents = db.get("consents").value();
//   console.log(`Loaded ${customers?.length || 0} customers`);
//   console.log(`Loaded ${consents?.length || 0} consent records`);
// });

const jsonServer = require("json-server");
const path = require("path");
const server = jsonServer.create();

// Update this path to match your project structure
// If server.js is in the root, use this:
const dbPath = path.join(__dirname, "mock-api", "db.json");
const router = jsonServer.router(dbPath);

const middlewares = jsonServer.defaults();
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

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
  console.log(
    `Database loaded from: ${path.join(__dirname, "mock-api", "db.json")}`
  );

  // Log what's in the database for debugging
  const customers = db.get("customers").value();
  const consents = db.get("consents").value();
  console.log(`Loaded ${customers?.length || 0} customers`);
  console.log(`Loaded ${consents?.length || 0} consent records`);
});
