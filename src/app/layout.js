import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/context/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'WhatsApp Desktop Clone',
  description: 'Clone de WhatsApp Desktop avec Next.js et Electron',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning className="h-full">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet"/>
      <body className={`${inter.className} h-full`} suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
