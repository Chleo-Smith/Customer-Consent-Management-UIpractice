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

    //check if 13 chracters
    if (customerId.length !== 13) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID_LENGTH",
          message: "ID number must be exactly 13 characters",
          customerId: customerId,
        },
      });
    }

    // check if all characters are numeric
    if (!/^\d{13}$/.test(customerId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID_FORMAT",
          message: "ID number must contain only numeric characters",
          customerId: customerId,
        },
      });
    }

    //check if first 6 digits is valid date format
    if (!isValidDateOfBirth(customerId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DATE_OF_BIRTH",
          message: "Invalid birth day entered",
          customerId: customerId,
        },
      });
    }
    try {
      // find customer in the database
      const customers = req.app.db.get("customers").value();
      const customer = customers.find((c) => c.customerId === customerId);

      if (customer) {
        // success response
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Internal server error",
          customerId: customerId,
        },
      });
    }
  }

  // continue to next middleware if no custom handling needed
  next();
};

function isValidDateOfBirth(idNumber) {
  // extract birth date (YYMMDD)
  const date = idNumber.substring(0, 6);

  // extract year, month and day
  const year = parseInt(date.substring(0, 2), 10);
  const month = parseInt(date.substring(2, 4), 10);
  const day = parseInt(date.substring(4, 6), 10);

  //if not valid month value
  if (month < 1 || month > 12) {
    return false;
  }

  //if not valid day value
  if (day < 1 || day > 31) {
    return false;
  }

  //determine full year
  const fullYear = year >= 50 ? 1900 + year : 2000 + year;

  const testDate = new Date(fullYear, month - 1, day);

  const isValidDate =
    testDate.getFullYear() === fullYear &&
    testDate.getMonth() === month - 1 &&
    testDate.getDate() === day;

  if (!isValidDate) {
    return false;
  }

  const currentDate = new Date();

  if (testDate > currentDate) {
    return false;
  }

  const maxAge = 120;
  const minBirthYear = currentDate.getFullYear() - maxAge;

  if (fullYear < minBirthYear) {
    return false;
  }

  return true;
}
