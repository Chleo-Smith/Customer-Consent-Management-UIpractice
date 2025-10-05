// API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// customer API Services
export const customerService = {
  // validate customer endpoint
  validateCustomer: async (customerId) => {
    try {
      const response = await apiRequest(`/api/customer/${customerId}/validate`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: error.message,
          customerId: customerId,
        },
      };
    }
  },

  // get all customers
  getAllCustomers: async () => {
    return await apiRequest("/api/customers");
  },

  // get customer by ID
  getCustomerById: async (customerId) => {
    return await apiRequest(`/api/customer/${customerId}`);
  },
};

export default {
  customerService,
};
