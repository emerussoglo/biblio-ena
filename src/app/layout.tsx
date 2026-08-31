"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Condition spécifique demandée pour masquer la Nav et le Footer
  const isDashboardArea =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/profil") ||
    pathname?.startsWith("/memoires") ||
    pathname?.startsWith("/catalogue") ||
    pathname === "/admin" ||
    pathname === "/stats";

  return (
    <html lang="fr">
      <head>
        {/* Vos liens Google Fonts et FontAwesome restent ici */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;700&family=Playwrite+IE:wght@100..400&display=swap" 
          rel="stylesheet" 
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
        />
        <link rel="shortcut icon" href="img/logo.jpeg" type="image/x-icon" />
      </head>
      <body>
        <div className="main-layout">
        
          {!isDashboardArea && <Navbar />}
          
          <main className={isDashboardArea ? "no-padding" : "page-content"}>
            {children}
          </main>
          
          {/* On n'affiche le Footer que si on n'est PAS dans les zones listées */}
          {!isDashboardArea && <Footer />}
        </div>
      </body>
    </html>
  );
}