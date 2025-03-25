import './globals.css'
import { ReactQueryProvider } from './react-query-provider'

export const metadata = {
  title: 'Tita',
  description: 'Configurable rule based funding platform',
}

const links: { label: string; path: string }[] = [
  { label: 'Account', path: '/account' },
  { label: 'Clusters', path: '/clusters' },
  { label: 'Basic Program', path: '/basic' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  )
}
