import type { Metadata } from "next";
import "./globals.css";
import Topbar from "../components/Topbar";

export const metadata: Metadata = {
  title: "Cisco",
 
  icons: [{ rel: "icon", url: "/favicon.svg" }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen w-full overflow-hidden">
        <Topbar />
        {children}
      </body>
    </html>
  );
}
