module.exports = (req, res, next) => {
  // cross origin resouce sharing
  // allows communication between frontend and backend
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // preflight request
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  //middleware for customer validation endpoint
  if (req.path.includes("/api/customer/") && req.path.includes("/validate")) {
    // Extract customer ID from URL path
    const pathParts = req.path.split("/");
    const customerIndex = pathParts.indexOf("customer") + 1;
    const customerId = pathParts[customerIndex];

    // find customer in the database
    const customers = req.app.db.get("customers").value();
    const customer = customers.find((c) => c.customerId === customerId);

    if (customer) {
      // //success response
      const response = {
        success: true,
        data: {
          customerId: customer.customerId,
          isValid: customer.isValid,
          customerName: customer.customerName,
          businessUnit: customer.businessUnit,
        },
      };
      return res.json(response);
    } else {
      // error response for non-existent customer
      const response = {
        success: false,
        error: {
          code: "CUSTOMER_NOT_FOUND",
          message: "Customer not found",
          customerId: customerId,
        },
      };
      return res.status(404).json(response);
    }
  }

  // continue to next middleware if no custom handling needed
  next();
};
