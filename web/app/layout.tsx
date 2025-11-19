import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AdherenceLens-G",
  description: "Go-based AI Medication Adherence Coach & Risk Explorer"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                🩺 AdherenceLens-G
              </h1>
              <p className="text-sm text-slate-400">
                AI Medication Adherence Coach & Risk Explorer
              </p>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
