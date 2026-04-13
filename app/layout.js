import './globals.css'

export const metadata = {
  title: 'Personal Backlog',
  description: 'Personal backlog to handle videogames\' data',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
