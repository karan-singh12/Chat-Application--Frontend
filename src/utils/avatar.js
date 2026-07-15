import { SOCKET_URL } from "@/config/api";

export function getAvatarUrl(avatarPath) {
  if (!avatarPath) return "/default-avatar.png";
  if (avatarPath.startsWith("http")) return avatarPath;
  const baseUrl = SOCKET_URL || "http://localhost:3003";
  const cleanPath = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
  return `${baseUrl}${cleanPath}`;
}
