import { API_BASE_URL } from "@/config/api";

const apiClient = {
  getHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("nexus_token") : null;
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...options.headers,
    };

    if (options.body instanceof FormData) {
      delete headers["Content-Type"];
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  postMultipart(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  },
};

export default apiClient;
