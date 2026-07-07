import apiClient from "./apiClient";

export const authService = {
  async login(email, password) {
    const res = await apiClient.post("/user/auth/login", {
      email,
      password,
    });
    return res;
  },

  async signup(username, email, password) {
    const res = await apiClient.post("/user/auth/signup", {
      username,
      email,
      password,
    });
    return res;
  },

  async getProfile() {
    const res = await apiClient.get("/users/profile");
    return res;
  },

  async updateProfile(profileData) {
    const res = await apiClient.put("/users/profile", profileData);
    return res;
  },
};
