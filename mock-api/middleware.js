const fetch = require("node-fetch");
const AbortController = require("abort-controller");

module.exports = (req, res, next) => {
  console.log("\n=== MIDDLEWARE HIT ===");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Body:", req.body);

  // cross origin resource sharing
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
    console.log("OPTIONS request - sending 200");
    res.sendStatus(200);
    return;
  }

  // middleware for customer validation endpoint
  if (req.path.match(/^\/api\/customer\/\d{13}$/) && req.method === "GET") {
    const pathParts = req.path.split("/");
    const customerIndex = pathParts.indexOf("customer") + 1;
    const customerId = pathParts[customerIndex];

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

  // middleware for customer consent endpoint
  if (
    req.path.match(/^\/api\/consents\/[a-zA-Z0-9\-]{13,}$/) &&
    req.method === "GET"
  ) {
    const pathParts = req.path.split("/");
    const consentsIndex = pathParts.indexOf("consents") + 1;
    const customerId = pathParts[consentsIndex];

    callCustomerConsentsAPI(customerId, req, res);
    return;
  }

  // PUT update individual consent endpoint
  if (
    req.path.match(/^\/api\/consents\/[a-zA-Z0-9\-]+\/\d+$/) &&
    req.method === "PUT"
  ) {
    const pathParts = req.path.split("/");
    const customerId = pathParts[3];
    const consentId = pathParts[4];

    const { status, statusType } = req.body;

    console.log("=== PUT Request Received ===");
    console.log("Customer ID:", customerId);
    console.log("Consent ID:", consentId);
    console.log("Status:", status);
    console.log("StatusType:", statusType);

    if (
      !status ||
      !statusType ||
      !["Declined", "Accepted", "DECLINED", "ACCEPTED"].includes(status) ||
      !["Explicit", "Implicit", "EXPLICIT", "IMPLICIT"].includes(statusType)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_CONSENT_DATA",
          message: `Invalid status "${status}" or statusType "${statusType}" in request body`,
        },
      });
    }

    // Try real API first, then fallback to mock
    updateConsentAPI(customerId, consentId, { status, statusType }, req, res);
    return;
  }

  next();
};

async function callCustomerIdAPI(nationalId, req, res) {
  const REAL_API_CONFIG = {
    baseUrl: "https://owafrdb867.execute-api.eu-west-1.amazonaws.com/sbx",
    timeout: 10000,
    enableFallback: process.env.ENABLE_MOCK_FALLBACK !== "false",
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    REAL_API_CONFIG.timeout
  );

  try {
    console.log(
      `Calling: ${REAL_API_CONFIG.baseUrl}/api/customer/${nationalId}`
    );

    const apiResponse = await fetch(
      `${REAL_API_CONFIG.baseUrl}/api/customer/${nationalId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Sanlam-ConsentUI/1.0",
        },
        signal: controller.signal,
      }
    );

    console.log(apiResponse.status, apiResponse.statusText);
    clearTimeout(timeoutId);

    if (apiResponse.ok) {
      let realApiData;
      try {
        const responseText = await apiResponse.text();
        realApiData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(
          "Failed to parse API response as JSON:",
          jsonError.message
        );
        throw new Error("Invalid JSON response from API");
      }

      // Check if the API returned an error (even with 200 status)
      if (realApiData.error) {
        console.error("API returned error:", realApiData.error);
        throw new Error(
          `API error: ${
            realApiData.error.detail || JSON.stringify(realApiData.error)
          }`
        );
      }

      if (!realApiData?.data?.customerId) {
        console.error(
          "API response missing required data. Full response:",
          JSON.stringify(realApiData, null, 2)
        );
        throw new Error("Invalid API response structure");
      }

      const transformedResponse = {
        success: realApiData.success || true,
        source: "real-api",
        data: {
          customerId: realApiData.data.customerId,
          isValid: realApiData.data.isValid,
          customerName: realApiData.data.customerName,
        },
      };

      return res.json(transformedResponse);
    } else if (apiResponse.status === 404) {
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
      console.error(
        `API error: ${apiResponse.status} ${apiResponse.statusText}`
      );
      throw new Error(
        `API returned ${apiResponse.status}: ${apiResponse.statusText}`
      );
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`API call failed:`, error.message);

    if (REAL_API_CONFIG.enableFallback) {
      console.log("Falling back to mock customer API...");
      return callMockCustomerAPI(nationalId, req, res);
    }

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

function callMockCustomerAPI(nationalId, req, res) {
  try {
    if (!req.app.db) {
      console.error("Database not initialized on req.app.db");
      return res.status(500).json({
        success: false,
        source: "mock-error",
        error: {
          code: "DATABASE_NOT_INITIALIZED",
          message: "Mock database is not available",
          customerId: nationalId,
        },
      });
    }

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
          businessUnits: [{ businessUnit: customer.businessUnit }],
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        source: "mock-fallback",
        error: {
          code: "CUSTOMER_NOT_FOUND",
          message: "Mock API fallback: Customer not found",
          customerId: nationalId,
        },
      });
    }
  } catch (error) {
    console.error("Mock customer API error:", error);
    return res.status(500).json({
      success: false,
      source: "mock-error",
      error: {
        code: "DATABASE_ERROR",
        message: "Internal server error",
        customerId: nationalId,
        details: error.message,
      },
    });
  }
}

function isValidDateOfBirth(idNumber) {
  const date = idNumber.substring(0, 6);
  const year = parseInt(date.substring(0, 2), 10);
  const month = parseInt(date.substring(2, 4), 10);
  const day = parseInt(date.substring(4, 6), 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const fullYear = year >= 50 ? 1900 + year : 2000 + year;
  const testDate = new Date(fullYear, month - 1, day);
  const isValidDate =
    testDate.getFullYear() === fullYear &&
    testDate.getMonth() === month - 1 &&
    testDate.getDate() === day;

  if (!isValidDate) return false;

  const currentDate = new Date();
  if (testDate > currentDate) return false;

  const maxAge = 120;
  const minBirthYear = currentDate.getFullYear() - maxAge;
  if (fullYear < minBirthYear) return false;

  return true;
}

async function callCustomerConsentsAPI(customerId, req, res) {
  const REAL_API_CONFIG = {
    baseUrl: "https://owafrdb867.execute-api.eu-west-1.amazonaws.com/sbx",
    timeout: 10000,
    enableFallback: process.env.ENABLE_MOCK_FALLBACK !== "false",
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    REAL_API_CONFIG.timeout
  );

  try {
    const apiResponse = await fetch(
      `${REAL_API_CONFIG.baseUrl}/api/consents/${customerId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Sanlam-ConsentUI/1.0",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (apiResponse.ok) {
      let realApiData;
      try {
        const responseText = await apiResponse.text();
        console.log("Raw consents API response:", responseText);
        realApiData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(
          "Failed to parse consents API response as JSON:",
          jsonError.message
        );
        throw new Error("Invalid JSON response from consents API");
      }

      if (!realApiData?.data?.businessUnits) {
        console.error("Consents API response missing required data");
        throw new Error("Invalid consents API response structure");
      }

      const transformedResponse = {
        success: realApiData.success || true,
        source: "real-api",
        data: {
          customerId: customerId,
          businessUnits: realApiData.data.businessUnits || [],
        },
      };

      return res.json(transformedResponse);
    } else if (apiResponse.status === 404) {
      return res.status(404).json({
        success: false,
        source: "real-api",
        error: {
          code: "CONSENTS_NOT_FOUND",
          message: "No consents found for this customer",
          customerId: customerId,
        },
      });
    } else {
      console.error(
        `Consents API error: ${apiResponse.status} ${apiResponse.statusText}`
      );
      throw new Error(
        `API returned ${apiResponse.status}: ${apiResponse.statusText}`
      );
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Consents API call failed:`, error.message);

    if (REAL_API_CONFIG.enableFallback) {
      console.log("Falling back to mock consents API...");
      return callMockCustomerConsentsAPI(customerId, req, res);
    }

    return res.status(500).json({
      success: false,
      source: "api-error",
      error: {
        code: "API_CONNECTION_ERROR",
        message: "Unable to connect to Sanlam consents service",
        customerId: customerId,
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Service temporarily unavailable",
      },
    });
  }
}

function callMockCustomerConsentsAPI(customerId, req, res) {
  try {
    if (!req.app.db) {
      console.error("Database not initialized on req.app.db");
      return res.status(500).json({
        success: false,
        source: "mock-error",
        error: {
          code: "DATABASE_NOT_INITIALIZED",
          message: "Mock database is not available",
          customerId: customerId,
        },
      });
    }

    const consents = req.app.db.get("consents").value();
    const customerConsents = consents.find((c) => c.customerId === customerId);

    if (customerConsents) {
      return res.json({
        success: true,
        source: "mock-fallback",
        data: {
          customerId: customerId,
          businessUnits: customerConsents.businessUnits,
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        source: "mock-fallback",
        error: {
          code: "CONSENTS_NOT_FOUND",
          message: "No consents found for this customer",
          customerId: customerId,
        },
      });
    }
  } catch (error) {
    console.error(`Mock consents API error:`, error);
    return res.status(500).json({
      success: false,
      source: "mock-error",
      error: {
        code: "DATABASE_ERROR",
        message: "Internal server error",
        customerId: customerId,
        details: error.message,
      },
    });
  }
}

// NEW: Try real API first, then fallback to mock
async function updateConsentAPI(customerId, consentId, consentData, req, res) {
  const REAL_API_CONFIG = {
    baseUrl: "https://owafrdb867.execute-api.eu-west-1.amazonaws.com/sbx",
    timeout: 10000,
    enableFallback: process.env.ENABLE_MOCK_FALLBACK !== "false",
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    REAL_API_CONFIG.timeout
  );

  try {
    console.log(
      `Calling: ${REAL_API_CONFIG.baseUrl}/api/consents/${customerId}/${consentId}`
    );

    const apiResponse = await fetch(
      `${REAL_API_CONFIG.baseUrl}/api/consents/${customerId}/${consentId}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Sanlam-ConsentUI/1.0",
        },
        body: JSON.stringify(consentData),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (apiResponse.ok) {
      const result = await apiResponse.json();
      console.log("Real API update successful:", result);
      return res.json({
        success: true,
        source: "real-api",
        message: "Consent updated successfully",
        data: result,
      });
    } else {
      console.error(
        `Update API error: ${apiResponse.status} ${apiResponse.statusText}`
      );
      throw new Error(
        `API returned ${apiResponse.status}: ${apiResponse.statusText}`
      );
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Update API call failed:`, error.message);

    if (REAL_API_CONFIG.enableFallback) {
      console.log("Falling back to mock update API...");
      return updateMockConsentAPI(customerId, consentId, consentData, req, res);
    }

    return res.status(500).json({
      success: false,
      source: "api-error",
      error: {
        code: "API_CONNECTION_ERROR",
        message: "Unable to update consent",
        customerId: customerId,
        consentId: consentId,
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Service temporarily unavailable",
      },
    });
  }
}

function updateMockConsentAPI(customerId, consentId, consentData, req, res) {
  try {
    console.log("=== updateMockConsentAPI called ===");
    console.log("customerId:", customerId);
    console.log("consentId:", consentId);
    console.log("consentData:", consentData);

    if (!req.app.db) {
      console.error("Database not initialized");
      return res.status(500).json({
        success: false,
        source: "mock-error",
        error: {
          code: "DATABASE_NOT_INITIALIZED",
          message: "Mock database is not available",
        },
      });
    }

    const consents = req.app.db.get("consents").value();
    const customerConsentRecord = consents.find(
      (c) => c.customerId === customerId
    );

    if (!customerConsentRecord) {
      return res.status(404).json({
        success: false,
        source: "mock-fallback",
        error: {
          code: "CONSENT_NOT_FOUND",
          message: "No consent record found for customer",
          customerId,
          consentId,
        },
      });
    }

    // Find the consent by its ID across all business units
    const consentIndex = parseInt(consentId, 10) - 1;
    let currentIndex = 0;
    let foundBusinessUnitIndex = -1;
    let foundConsentIndex = -1;

    for (
      let buIndex = 0;
      buIndex < customerConsentRecord.businessUnits.length;
      buIndex++
    ) {
      const businessUnit = customerConsentRecord.businessUnits[buIndex];
      for (let cIndex = 0; cIndex < businessUnit.consents.length; cIndex++) {
        if (currentIndex === consentIndex) {
          foundBusinessUnitIndex = buIndex;
          foundConsentIndex = cIndex;
          break;
        }
        currentIndex++;
      }
      if (foundBusinessUnitIndex !== -1) break;
    }

    if (foundBusinessUnitIndex === -1 || foundConsentIndex === -1) {
      return res.status(404).json({
        success: false,
        source: "mock-fallback",
        error: {
          code: "CONSENT_NOT_FOUND",
          message: "Consent not found at specified index",
          customerId,
          consentId,
        },
      });
    }

    // Normalize the status values
    const normalizedStatus = consentData.status.toUpperCase();
    const normalizedStatusType = consentData.statusType.toUpperCase();

    // Find the record index
    const recordIndex = consents.findIndex((c) => c.customerId === customerId);

    // Update the consent in the database
    req.app.db
      .get("consents")
      .nth(recordIndex)
      .get("businessUnits")
      .nth(foundBusinessUnitIndex)
      .get("consents")
      .nth(foundConsentIndex)
      .assign({
        status: normalizedStatus,
        statusType: normalizedStatusType,
        lastUpdated: new Date().toISOString(),
      })
      .write();

    console.log("Mock database updated successfully");

    const updatedConsent = req.app.db
      .get("consents")
      .nth(recordIndex)
      .get("businessUnits")
      .nth(foundBusinessUnitIndex)
      .get("consents")
      .nth(foundConsentIndex)
      .value();

    return res.json({
      success: true,
      source: "mock-fallback",
      message: "Consent updated successfully",
      data: {
        customerId,
        consentId,
        updatedConsent,
      },
    });
  } catch (error) {
    console.error("Mock consent update error:", error);
    return res.status(500).json({
      success: false,
      source: "mock-error",
      error: {
        code: "DATABASE_ERROR",
        message: "Internal server error",
        customerId,
        consentId,
        details: error.message,
      },
    });
  }
}
