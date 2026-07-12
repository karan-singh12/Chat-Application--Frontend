import apiClient from "./apiClient";

export const postService = {
  async createPost(content) {
    try {
      const res = await apiClient.post("/posts", { content });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getFeed() {
    try {
      const res = await apiClient.get("/posts");
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async likePost(postId) {
    try {
      const res = await apiClient.post(`/posts/${postId}/like`, {});
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async addComment(postId, content) {
    try {
      const res = await apiClient.post(`/posts/${postId}/comment`, { content });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};
