import { LayoutClient } from './layout-client'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata = {
  title: 'Resume Builder',
  description: 'Create professional resumes easily',
  metadataBase: new URL('https://yourdomain.com'),
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  )
}