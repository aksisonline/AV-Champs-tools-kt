import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AV Tools - Professional Tools for AV Professionals",
  description:
    "Access a comprehensive suite of professional tools designed specifically for audio-visual professionals.",
}

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>{children}</main>
    </div>
  )
}
