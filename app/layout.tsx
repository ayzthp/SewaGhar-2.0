'use client';

import type { ReactNode } from 'react';
import ClientComponent from '@/components/ClientComponent';
import './globals.css';

function BodyContent({ children }: { children: ReactNode }) {
  return (
    <>
      <ClientComponent />
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Service Request App. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen flex flex-col" suppressHydrationWarning>
        <BodyContent>{children}</BodyContent>
      </body>
    </html>
  );
}

