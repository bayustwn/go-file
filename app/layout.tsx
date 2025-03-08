import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import './globals.css'

const roboto = Inter({
  subsets: ["latin"],
  weight: ["400", "700"], 
  display: "swap",
});

export const metadata: Metadata = {
  title: "Go File",
  description: "Store your file",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`text-white bg-blue-500 ${roboto.className} antialiased`}
      >
        <Toaster 
          toastOptions={{
            style:{
              background : '#1E293B',
              color: '#ffffff'
            }
          }}
        />
        {children}
      </body>
    </html>
  );
}
