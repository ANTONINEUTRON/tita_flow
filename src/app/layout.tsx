import Provider from '@/lib/providers/providers';
import './globals.css'
import { ReactQueryProvider } from './react-query-provider'
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Tita Flow | Configurable Fundraising Protocol on Solana',
  description: 'Secure transparent funding with configurable milestones and community governance. The most trusted fundraising platform for Web3 projects on Solana blockchain.',
  keywords: 'solana fundraising, milestone funding, web3 crowdfunding, crypto fundraising, blockchain governance, defi fundraising',
  openGraph: {
    title: 'Tita Flow | Configurable Fundraising Protocol on Solana',
    description: 'Secure transparent funding with configurable milestones and community governance.',
    images: [{ url: '/logo.png' }],
  },
}

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
