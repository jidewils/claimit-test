import './globals.css';

export const metadata = {
  title: 'ClaimIt - Find Tax Credits You\'re Missing',
  description: 'Discover tax credits and deductions you didn\'t know existed. See your estimated refund in 5 minutes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950">{children}</body>
    </html>
  );
}
