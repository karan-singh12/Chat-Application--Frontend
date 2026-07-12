import apiClient from "./apiClient";

export const postService = {
  async createPost(content, imageUrl = null) {
    try {
      const res = await apiClient.post("/posts", { content, imageUrl });
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

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("imagePath", "general");
      const res = await apiClient.postMultipart("/uploads", formData);
      return res;
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};
