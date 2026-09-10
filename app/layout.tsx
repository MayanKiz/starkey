import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'AKGEC Community',description:'Private PIN-protected campus community'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}