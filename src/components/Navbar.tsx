"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="main-nav">
      <div className="nav-container">
        {/* Logo */}
        <Link href="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <div className="logo-icon">
            {/* <i className="fa-solid fa-book-bookmark"></i> */}
            <img src="/img/logo.jpeg" alt="" />
          </div>
          <div className="logo-text">
            <strong>Bibliothèque</strong>
            <strong>ENA</strong>
            {/* <span>ENAM</span> */}
          </div> 
        </Link> 

        {/* Burger Mobile */}
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          <i className={isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
        </button>

        {/* Liens de Navigation */}
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          <li>
            <Link 
              href="/" 
              className={pathname === '/' ? 'active' : ''} 
              onClick={() => setIsOpen(false)}
            >
              <i className="fa-solid fa-house"></i> Accueil
            </Link>
          </li>

          <li>
            <Link 
              href="/register" 
              className={pathname === '/register' ? 'active' : ''} 
              onClick={() => setIsOpen(false)}
            >
              <i className="fa-solid fa-user-plus"></i> Inscription
            </Link>
          </li>

          <li className="nav-auth">
            <Link 
              href="/login" 
              className="btn-login-nav" 
              onClick={() => setIsOpen(false)}
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              Connexion
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}