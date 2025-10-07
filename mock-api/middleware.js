const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware function
function withCors(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  return res;
}

// Apply CORS to all requests
app.use((req, res, next) => {
  withCors(res);

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  console.log(` ${req.method} ${req.originalUrl}`);
  next();
});

// Customer validation endpoint
app.get("/api/customer/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
  console.log(`Customer lookup: ${customerId}`);

  // Check if first 6 digits is valid date format
  if (!isValidDateOfBirth(customerId)) {
    return withCors(res)
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_DATE_OF_BIRTH",
          message: "Invalid birth day entered",
          customerId: customerId,
        },
      });
  }

  return await callCustomerIdAPI(customerId, req, res);
});

// Customer consents endpoint
app.get("/api/consents/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
  console.log(`Consents lookup: ${customerId}`);

  return await callCustomerConsentsAPI(customerId, req, res);
});

// PUT update individual consent endpoint
// app.put("/api/consents/:customerId/:consentId", async (req, res) => {
//   const { customerId, consentId } = req.params;
//   console.log(`📝 Update consent: ${customerId}/${consentId}`);

//   if (!isValidDateOfBirth(customerId)) {
//     return withCors(res)
//       .status(400)
//       .json({
//         success: false,
//         error: {
//           code: "INVALID_DATE_OF_BIRTH",
//           message: "Invalid birth day entered",
//           customerId: customerId,
//         },
//       });
//   }

//   const { status, statusType } = req.body;

//   // Changed "Approved" to "Accepted" to match frontend
//   if (
//     !status ||
//     !statusType ||
//     (status !== "Declined" && status !== "Accepted") ||
//     (statusType !== "Explicit" && statusType !== "Implicit")
//   ) {
//     return withCors(res)
//       .status(400)
//       .json({
//         success: false,
//         error: {
//           code: "INVALID_CONSENT_DATA",
//           message: "Invalid status or statusType in request body",
//         },
//       });
//   }

//   return await updateConsentAPI(
//     customerId,
//     consentId,
//     { status, statusType },
//     req,
//     res
//   );
// });

// Serve static files (React build)
app.use(express.static(path.join(__dirname, "..", "build")));

// Catch-all for React Router
app.get("*", (req, res) => {
  console.log(`Serving index.html for: ${req.path}`);
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  withCors(res)
    .status(500)
    .json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
});

async function callCustomerIdAPI(nationalId, req, res) {
  const REAL_API_CONFIG = {
    baseUrl:
      process.env.REAL_API_BASE_URL ||
      "https://owafrdb867.execute-api.eu-west-1.amazonaws.com/sbx",
    timeout: 10000,
  };

  try {
    const apiResponse = await fetch(
      `${REAL_API_CONFIG.baseUrl}/api/customer/${nationalId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Sanlam-ConsentUI/1.0",
        },
      }
    );

    const contentType = apiResponse.headers.get("content-type");
    const rawResponseText = await apiResponse.text();

    if (!contentType || !contentType.includes("application/json")) {
      console.error("Non-JSON response:", rawResponseText.substring(0, 500));

      return withCors(res)
        .status(502)
        .json({
          success: false,
          source: "api-error",
          error: {
            code: "INVALID_RESPONSE_FORMAT",
            message: "Customer service returned an invalid format",
            customerId: nationalId,
          },
        });
    }

    let realApiData;

    try {
      realApiData = JSON.parse(rawResponseText);
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError.message);

      return withCors(res)
        .status(502)
        .json({
          success: false,
          source: "parse-error",
          error: {
            code: "INVALID_JSON_RESPONSE",
            message: "Customer service returned malformed data",
            customerId: nationalId,
            details:
              process.env.NODE_ENV === "development"
                ? jsonError.message
                : undefined,
          },
        });
    }

    if (
      apiResponse.ok &&
      realApiData.success !== false &&
      realApiData.data?.customerId
    ) {
      console.log("Customer found successfully");
      return withCors(res).json({
        success: true,
        source: "sanlam-api-eb",
        data: {
          customerId: realApiData.data.customerId,
          isValid: realApiData.data.isValid,
          customerName: realApiData.data.customerName,
          businessUnits: realApiData.data.businessUnits || [],
        },
      });
    }

    // API returned success: false
    if (realApiData.success === false && realApiData.error) {
      console.warn("API returned error:", realApiData.error);
      const errorMessage =
        realApiData.error.detail || "Customer not found in system";

      return withCors(res)
        .status(realApiData.error.status || 404)
        .json({
          success: false,
          source: "real-api",
          error: {
            code: "CUSTOMER_NOT_FOUND",
            message: "Customer not found",
            customerId: nationalId,
          },
        });
    }
  } catch (error) {
    console.error("Network/API call failed:", error.message);
    return withCors(res)
      .status(503)
      .json({
        success: false,
        source: "network-error",
        error: {
          code: "NETWORK_ERROR",
          message: "Unable to connect to Sanlam customer service",
          customerId: nationalId,
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
      });
  }
}

async function updateConsentAPI(customerId, consentId, consentData, req, res) {
  const REAL_API_CONFIG = {
    baseUrl: "https://owafrdb867.execute-api.eu-west-1.amazonaws.com/sbx",
    timeout: 10000,
    enableFallback: process.env.ENABLE_MOCK_FALLBACK !== "false",
  };

  try {
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
        timeout: REAL_API_CONFIG.timeout,
      }
    );

    if (apiResponse.ok) {
      const responseData = await apiResponse.json();

      return res.json({
        success: true,
        message: "Consent updated successfully",
        data: responseData.data,
      });
    } else if (apiResponse.status === 404) {
      return res.status(404).json({
        success: false,
        source: "real-api",
        error: {
          code: "CONSENT_NOT_FOUND",
          message: "Consent not found for update",
          customerId,
          consentId,
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
    console.error(`API call failed:`, error.message);

    if (REAL_API_CONFIG.enableFallback) {
      return updateMockConsentAPI(customerId, consentId, consentData, req, res);
    }

    return res.status(500).json({
      success: false,
      source: "api-error",

      error: {
        code: "API_CONNECTION_ERROR",
        message: "Unable to connect to Sanlam consent service",
        customerId,
        consentId,
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
    const consents = req.app.db.get("consents").value();

    const consentIndex = consents.findIndex(
      (c) => c.customerId === customerId && c.id.toString() === consentId
    );

    if (consentIndex === -1) {
      return res.status(404).json({
        success: false,
        source: "mock-fallback",
        error: {
          code: "CONSENT_NOT_FOUND",
          message: "Mock API fallback: Consent not found",
          customerId,
          consentId,
        },
      });
    }

    req.app.db
      .get("consents")
      .nth(consentIndex)
      .assign({
        status: consentData.status,
        statusType: consentData.statusType,
        lastUpdated: new Date().toISOString(),
      })
      .write();

    const updatedConsent = req.app.db.get("consents").nth(consentIndex).value();

    return res.json({
      success: true,
      source: "mock-fallback",
      message: "Consent updated successfully",
      data: updatedConsent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      source: "mock-error",
      error: {
        code: "DATABASE_ERROR",
        message: "Internal server error",
        customerId,
        consentId,
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

async function callCustomerConsentsAPI(customerId, req, res) {
  const REAL_API_CONFIG = {
    baseUrl:
      process.env.REAL_API_BASE_URL ||
      "https://owafrdb867.execute-api.eu-west-1.amazonaws.com/sbx",
    timeout: 10000,
  };

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
      }
    );

    const rawText = await apiResponse.text();
    const contentType = apiResponse.headers.get("content-type");

    // Clean up possible invalid commas
    const cleanedText = rawText.replace(/,\s*([}\]])/g, "$1");

    let realApiData;

    try {
      realApiData = JSON.parse(cleanedText);
    } catch (jsonError) {
      console.error("JSON Parse Error (Consents):", jsonError.message);
      return withCors(res)
        .status(502)
        .json({
          success: false,
          source: "parse-error",
          error: {
            code: "INVALID_JSON_RESPONSE",
            message: "Consents service returned malformed data",
            customerId,
          },
        });
    }

    //Real API explicitly says success = true
    if (apiResponse.ok && realApiData?.success !== false) {
      console.log("Consents fetched successfully");
      return withCors(res).json({
        success: true,
        source: "real-api",
        data: {
          customerId,
          businessUnits: realApiData.data?.businessUnits || [],
        },
      });
    }

    // Real API includes an error field with 404
    if (realApiData?.error?.status === 404) {
      console.warn("Real API returned 404 Not Found:", realApiData.error);
      return withCors(res)
        .status(404)
        .json({
          success: false,
          source: "real-api",
          error: {
            code: "CONSENTS_NOT_FOUND",
            message:
              realApiData.error.detail || "No consents found for this customer",
            customerId,
          },
        });
    }

    // API response status is 404 but no error object
    if (apiResponse.status === 404) {
      console.warn(`API responded 404 for customer ${customerId}`);
      return withCors(res)
        .status(404)
        .json({
          success: false,
          source: "real-api",
          error: {
            code: "CONSENTS_NOT_FOUND",
            message: "No consents found for this customer",
            customerId,
          },
        });
    }

    if (!apiResponse.ok || realApiData?.success === false) {
      console.error(
        `Consents API Error ${apiResponse.status}:`,
        realApiData?.error || apiResponse.statusText
      );

      return withCors(res)
        .status(apiResponse.status || 500)
        .json({
          success: false,
          source: "real-api",
          error: {
            code: realApiData?.error?.status || "API_ERROR",
            message:
              realApiData?.error?.detail ||
              apiResponse.statusText ||
              "Unexpected error from Consents API",
            customerId,
          },
        });
    }

    return withCors(res)
      .status(200)
      .json({
        success: true,
        source: "real-api",
        data: {
          customerId,
          businessUnits: realApiData.data?.businessUnits || [],
        },
      });
  } catch (error) {
    console.error("Network error calling consents API:", error.message);

    return withCors(res)
      .status(500)
      .json({
        success: false,
        source: "network-error",
        error: {
          code: "NETWORK_ERROR",
          message: "Unable to connect to Sanlam consents service",
          customerId,
        },
      });
  }
}

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {});

module.exports = app;
