import { Geist, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "NexusChat | Connect Beyond Boundaries",
  description: "Experience ultra-fast, encrypted, and seamless communication designed for the modern era.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background-app text-on-surface">
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
