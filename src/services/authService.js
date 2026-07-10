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

  async getPublicProfile(idOrUsername) {
    const res = await apiClient.get(`/users/profile/${idOrUsername}`);
    return res;
  },

  async updateProfile(profileData) {
    const res = await apiClient.put("/users/profile", profileData);
    return res;
  },

  async sendFriendRequest(identifier) {
    const res = await apiClient.post("/users/friends/request", {
      identifier,
    });
    return res;
  },

  async getFriendRequests(type = "all") {
    const res = await apiClient.get(`/users/friends/requests?type=${type}`);
    return res;
  },

  async respondToFriendRequest(id, status) {
    const res = await apiClient.put(`/users/friends/requests/${id}`, {
      status,
    });
    return res;
  },

  async getFriendsList() {
    const res = await apiClient.get("/users/friends/list");
    return res;
  },

  async removeFriend(friendId) {
    const res = await apiClient.delete(`/users/friends/${friendId}`);
    return res;
  },

  async getFriendSuggestions() {
    const res = await apiClient.get("/users/friends/suggestions");
    return res;
  },
};
