import Provider from '@/lib/providers/providers';
import './globals.css'
import { ReactQueryProvider } from './react-query-provider'
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'TitaFlow',
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
        <Provider>
          <Toaster />
          {children}
        </Provider>
      </body>
    </html>
  )
}
