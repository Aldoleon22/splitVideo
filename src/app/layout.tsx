import { Providers } from "./providers"
import "./globals.css"
import { ClientProviders } from "@/components/ClientProviders"
import { ToastContainer } from "react-toastify"

export const metadata = {
  title: "SplitVideo",
  description: "Application de découpage vidéo",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body>
        <Providers>
          <ClientProviders>{children}</ClientProviders>
          <ToastContainer
  position="top-right"
  autoClose={5000} // Ferme après 5 secondes
  hideProgressBar={false}
  newestOnTop={true}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="dark" // "light" | "colored"
/>
        </Providers>
      </body>
    </html>
  )
}

