const fetch = require("node-fetch");

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

    callCustomerIdAPI(customerId, req, res);
    return;
  }
  next();
};

async function callCustomerIdAPI(nationalId, req, res) {
  // Configuration for the real API
  const REAL_API_CONFIG = {
    baseUrl: "https://owafrdb867.execute-api.eu-west-1.amazonaws.com/sbx",
    timeout: 10000, // 10 seconds
    // enableFallback: process.env.ENABLE_MOCK_FALLBACK !== "false",
  };

  try {
    // call the real AWS API endpoint
    const apiResponse = await fetch(
      `${REAL_API_CONFIG.baseUrl}/api/customer/${nationalId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Sanlam-ConsentUI/1.0",
        },
        timeout: REAL_API_CONFIG.timeout,
      }
    );

    if (apiResponse.ok) {
      const realApiData = await apiResponse.json();

      const transformedResponse = {
        success: realApiData.success || true,
        data: {
          customerId: realApiData.data.customerId,
          isValid: realApiData.data.isValid,
          customerName: realApiData.data.customerName,
        },
      };

      return res.json(transformedResponse);
    } else if (apiResponse.status === 404) {
      // if customer not found in system
      return res.status(404).json({
        success: false,
        source: "real-api",
        error: {
          code: "CUSTOMER_NOT_FOUND",
          message: "Customer not found in system",
          customerId: nationalId,
        },
      });
    } else {
      // API errors
      console.error(
        `API error: ${apiResponse.status} ${apiResponse.statusText}`
      );
      throw new Error(
        `API returned ${apiResponse.status}: ${apiResponse.statusText}`
      );
    }
  } catch (error) {
    console.error(`API call failed:`, error.message);

    // fallback to mock data if enabled
    // if (REAL_API_CONFIG.enableFallback) {
    //   return callMockCustomerAPI(nationalId, req, res);
    // }

    // return error if no fallback enabled
    return res.status(500).json({
      success: false,
      source: "api-error",
      error: {
        code: "API_CONNECTION_ERROR",
        message: "Unable to connect to Sanlam customer service",
        customerId: nationalId,
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Service temporarily unavailable",
      },
    });
  }
}

//mock api call
function callMockCustomerAPI(nationalId, req, res) {
  try {
    // mock database logic
    const customers = req.app.db.get("customers").value();
    const customer = customers.find((c) => c.customerId === nationalId);

    if (customer) {
      return res.json({
        success: true,
        source: "mock-fallback",
        data: {
          customerId: customer.customerId,
          isValid: customer.isValid,
          customerName: customer.customerName,
          businessUnit: customer.businessUnit,
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        source: "mock-fallback",
        error: {
          code: "CUSTOMER_NOT_FOUND",
          message: "Customer not found",
          customerId: nationalId,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      source: "mock-error",
      error: {
        code: "DATABASE_ERROR",
        message: "Internal server error",
        customerId: nationalId,
      },
    });
  }
}

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
