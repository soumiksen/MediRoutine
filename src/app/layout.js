import Navbar from '@/components/navbar';
import './globals.css';
import { AuthProvider } from '@/context/auth';

export const metadata = {
  title: 'RemedyRX',
  description: 'RemedyRX - Your Personal Medication Reminder',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
    
      <body className={`antialiased`}>
        <AuthProvider>
          <Navbar/>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
