import { ConfigProvider } from 'antd';
import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";


const mulish = Mulish({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mulish"
})

export const metadata: Metadata = {
  title: "Tabi",
  description: "Sistema de gestión de cultivos cafeteros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${mulish.className} ${mulish.variable} font-sans subpixel-antialiased`}>
        <ConfigProvider
          theme={{
            token: {
              // Seed Token
              fontFamily: "Mulish",

              borderRadius: 8,

              // Colors
              colorPrimary: "#63A91F",
              colorInfo: "#63A91F",
              colorLink: "#63A91F",
              colorTextBase: "#412F26",
              colorBgBase: "#F4EEE6",


            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
