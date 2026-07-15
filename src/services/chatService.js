import apiClient from "./apiClient";

export const chatService = {
  // ─── Conversations (1:1) ────────────────────────────────────────────────────

  async getConversations() {
    const res = await apiClient.get("/conversations");
    return res.data?.conversations || [];
  },

  async createConversation(otherUserId) {
    const res = await apiClient.post("/conversations", { otherUserId });
    return res.data?.conversation || null;
  },

  async getConversationMessages(conversationId) {
    const res = await apiClient.get(`/conversations/${conversationId}/messages`);
    return res.data?.messages || [];
  },

  // ─── Groups ─────────────────────────────────────────────────────────────────

  async getGroups() {
    const res = await apiClient.get("/groups");
    return res.data?.groups || [];
  },

  async createGroup(name, memberIds, avatar) {
    const res = await apiClient.post("/groups", { name, memberIds, avatar });
    return res.data?.group || null;
  },

  async getGroupMessages(groupId) {
    const res = await apiClient.get(`/groups/${groupId}/messages`);
    return res.data?.messages || [];
  },

  // ─── Call History ───────────────────────────────────────────────────────────

  async getCallHistory() {
    const res = await apiClient.get("/calls");
    return res.data || [];
  },

  async createCallLog(receiverId, status, video, duration) {
    const res = await apiClient.post("/calls", { receiverId, status, video, duration });
    return res.data || null;
  },

  async clearCallHistory() {
    const res = await apiClient.delete("/calls");
    return res.data || null;
  },
};

