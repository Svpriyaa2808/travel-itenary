import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelPlanner - Your Perfect Trip Companion",
  description: "Plan your perfect trip with personalized itineraries, hotel recommendations, and travel insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
