import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Huguito Copilot — Humand Help Center",
  description: "Centro de ayuda de Humand con Huguito Copilot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
