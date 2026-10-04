"use client";
import Image from "next/image";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="main-nav">
        <div className="nav-container">
          <Link href="/" className="nav-logo" onClick={() => setIsOpen(false)}>
            <div className="logo-icon">
              <Image src="/img/logo.jpeg" alt="" width={44} height={44} />
            </div>
            <div className="logo-text">
              <strong>Bibliothèque</strong>
              <strong>ENA</strong>
            </div>
          </Link>

          <button
            className="menu-toggle"
            type="button"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className={isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
          </button>

          <ul className={`nav-links ${isOpen ? "open" : ""}`}>
            <li>
              <Link
                href="/"
                className={pathname === "/" ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                <i className="fa-solid fa-house"></i> Accueil
              </Link>
            </li>

            <li>
              <Link
                href="/register"
                className={pathname === "/register" ? "active" : ""}
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

      <nav
        className={`public-tabbar ${isOpen ? "is-menu-open" : ""}`}
        aria-label="Navigation mobile"
      >
        {[
          { label: "Accueil", href: "/", icon: "fa-house" },
          { label: "Connexion", href: "/login", icon: "fa-right-to-bracket" },
          { label: "Catalogue", href: "/catalogue", icon: "fa-book-open" },
          { label: "Enregistrement", href: "/register", icon: "fa-user-plus" },
        ].map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/catalogue" && pathname.startsWith("/catalogue"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}