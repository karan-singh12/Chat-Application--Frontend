import apiClient from "./apiClient";

export const chatService = {
  async getChats() {
    const res = await apiClient.get("/chats");
    return res.chats || [];
  },

  async getMessages(chatId) {
    const res = await apiClient.get(`/messages?chatId=${chatId}`);
    return res.messages || [];
  },

  async sendMessage(chatId, text) {
    const res = await apiClient.post("/messages", {
      chatId,
      text,
    });
    return res;
  },

  async reactToMessage(chatId, messageId, emoji) {
    const res = await apiClient.post("/messages/react", {
      chatId,
      messageId,
      emoji,
    });
    return res;
  },
};
