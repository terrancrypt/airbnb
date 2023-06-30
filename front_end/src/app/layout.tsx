import Navbar from '@/components/navbar/Navbar';
import './globals.css';
import { Nunito } from 'next/font/google';
import Modal from '@/components/modals/Modal';
import RegisterModal from '@/components/modals/RegisterModal';
import ToasterProvider from '@/providers/ToasterProvider';

const font = Nunito({ subsets: ['latin'] });

export const metadata = {
    title: 'AirBnb',
    description: 'Air Bnb Clone',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={font.className}>
                <ToasterProvider/>
                <RegisterModal />
                <Navbar />
                {children}
            </body>
        </html>
    );
}
