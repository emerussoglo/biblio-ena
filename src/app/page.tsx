"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Faq from "@/components/Faq";
import Features from "@/components/Features";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Se charge pendant 1.5 secondes

    return () => clearTimeout(timer);
  }, []);

  // Détection des éléments au scroll avec IntersectionObserver
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      {
        threshold: 0.15, // L'élément s'anime dès que 15% est visible à l'écran
      },
    );

    const revealElements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale",
    );
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="loader-screen-overlay">
        <svg
          viewBox="0 0 240 240"
          height="240"
          width="240"
          className="page-custom-loader"
        >
          <circle
            strokeLinecap="round"
            strokeDashoffset="-330"
            strokeDasharray="0 660"
            strokeWidth="20"
            stroke="#000"
            fill="none"
            r="105"
            cy="120"
            cx="120"
            className="loader-circle circle-alpha"
          ></circle>
          <circle
            strokeLinecap="round"
            strokeDashoffset="-110"
            strokeDasharray="0 220"
            strokeWidth="20"
            stroke="#000"
            fill="none"
            r="35"
            cy="120"
            cx="120"
            className="loader-circle circle-beta"
          ></circle>
          <circle
            strokeLinecap="round"
            strokeDasharray="0 440"
            strokeWidth="20"
            stroke="#000"
            fill="none"
            r="70"
            cy="120"
            cx="85"
            className="loader-circle circle-gamma"
          ></circle>
          <circle
            strokeLinecap="round"
            strokeDasharray="0 440"
            strokeWidth="20"
            stroke="#000"
            fill="none"
            r="70"
            cy="120"
            cx="155"
            className="loader-circle circle-delta"
          ></circle>
        </svg>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <header className="hero-section">
        <div className="hero-content reveal">
          <h1>
            Bibliothèque de l'École <br />
            <span className="highlight">Nationale d'Administration</span>
          </h1>
          <p className="hero-description">
            Explorez notre catalogue exhaustif, gérez vos recherches en un clic.
            Une plateforme unique pour s'inscrire, consulter les bases de
            données académiques et accéder à l'excellence documentaire de l'ENA.
          </p>

          <div className="link">
            <Link href="/login" className="btn-main">
              <span>Catalogue</span>
              <i className="fa-solid fa-book-bookmark"></i>
            </Link>

            <Link href="/login" className="btn-main btn-second">
              <span>Enregistrement</span>
              <i className="fa-solid fa-circle-arrow-right"></i>
            </Link>
          </div>
        </div>
      </header>

      <section className="interactive-feature-wrapper">
        <div className="visual-stage reveal-scale">
          <div className="main-image-container">
            <img
              src="/img/img1.jpeg"
              alt="SDA ENAM Interface"
              className="featured-display-img"
            />
          </div>

          <svg className="bg-curve-decoration" viewBox="0 0 500 500">
            <path
              d="M0,100 C150,200 350,0 500,100"
              fill="none"
              stroke="#1a5d2b"
              strokeWidth="2"
              strokeOpacity=".8"
            />
          </svg>
        </div>
      </section>

      <div className="reveal">
        <Features />
      </div>

      <section className="resources-container">
        {/* --- EN-TÊTE DE SECTION --- */}
        <div className="resources-header reveal">
          <span className="resources-subtitle">Bases de données</span>
          <h2>Ressources Documentaires en Ligne</h2>
          <p>
            Accédez directement aux principales plateformes de recherche
            académique, scientifique et juridique pour enrichir vos travaux et
            mémoires.
          </p>
        </div>

        <div className="resources-grid">
          {/* Carte 1 : Cairn */}
          <div className="resource-card reveal">
            <div className="resource-header">
              <div className="resource-img-container">
                <img
                  src="/img/cairn.png"
                  alt="Cairn.info"
                  className="resource-thumb"
                />
              </div>
              <h3>Cairn.info</h3>
            </div>
            <p className="resource-desc">
              Portail francophone de référence donnant accès à plus de 600
              revues et 21 000 ouvrages en sciences humaines et sociales.
            </p>
            <a
              href="https://shs.cairn.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Accéder</span>
            </a>
          </div>

          {/* Carte 2 : DICAMES */}
          <div className="resource-card reveal">
            <div className="resource-header">
              <div className="resource-img-container">
                <img
                  src="/img/dicarmes.png"
                  alt="DICAMES"
                  className="resource-thumb"
                />
              </div>
              <h3>DICAMES — Archive scientifique</h3>
            </div>
            <p className="resource-desc">
              Archive numérique institutionnelle du CAMES. Diffuse en accès
              libre la production scientifique des universités africaines.
            </p>
            <a
              href="https://dicames.online/"
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Accéder</span>
            </a>
          </div>

          {/* Carte 3 : Google Scholar */}
          <div className="resource-card reveal">
            <div className="resource-header">
              <div className="resource-img-container">
                <img
                  src="/img/schoolar.jpg"
                  alt="Google Scholar"
                  className="resource-thumb"
                />
              </div>
              <h3>Google Scholar</h3>
            </div>
            <p className="resource-desc">
              Moteur de recherche académique mondial. Permet de trouver
              articles, thèses, livres et brevets dans toutes les disciplines.
            </p>
            <a
              href="https://scholar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Accéder</span>
            </a>
          </div>

          {/* Carte 4 : Persée */}
          <div className="resource-card reveal">
            <div className="resource-header">
              <div className="resource-img-container">
                <img
                  src="/img/persee.png"
                  alt="Persée"
                  className="resource-thumb"
                />
              </div>
              <h3>Persée</h3>
            </div>
            <p className="resource-desc">
              Archives numériques de revues scientifiques françaises en sciences
              humaines et sociales, en accès entièrement gratuit.
            </p>
            <a
              href="https://www.persee.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Accéder</span>
            </a>
          </div>

          {/* Carte 5 : LEGIS */}
          <div className="resource-card reveal">
            <div className="resource-header">
              <div className="resource-img-container">
                <img
                  src="/img/gouv.jpg"
                  alt="LEGIS Bénin"
                  className="resource-thumb"
                />
              </div>
              <h3>LEGIS</h3>
            </div>
            <p className="resource-desc">
              Base de données officielle des textes de loi de la République du
              Bénin, mise en œuvre par le Ministère de la Justice. Accès libre
              aux normes juridiques en vigueur.
            </p>
            <a
              href="https://legis.cdij.bj/"
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Accéder</span>
            </a>
          </div>

          {/* Carte 6 : SGG */}
          <div className="resource-card reveal">
            <div className="resource-header">
              <div className="resource-img-container">
                <img
                  src="/img/gouv.jpg"
                  alt="SGG Bénin"
                  className="resource-thumb"
                />
              </div>
              <h3>SGG — Secrétariat Général du Gouvernement</h3>
            </div>
            <p className="resource-desc">
              Plateforme officielle de publication des décrets, lois
              promulguées, ordonnances et comptes rendus du Conseil des
              Ministres du Bénin.
            </p>
            <a
              href="https://sgg.gouv.bj/"
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Accéder</span>
            </a>
          </div>
        </div>
      </section>

      <div className="reveal">
        <Faq />
      </div>

      <main className="content-container">
        <section className="info-card reveal">
          <h3>
            <i className="fa-solid fa-circle-info"></i> À propos du SDA
          </h3>
          <p>
            Le Service de la Documentation et des Archives (SDA) de l'ENA met à
            votre disposition un fonds documentaire riche :
            <strong>
              {" "}
              mémoires, monographies, revues et ressources numériques en ligne.
            </strong>
            Ouvert aux étudiants, enseignants, chercheurs et visiteurs.
          </p>
        </section>
      </main>

      <div className="info-grid">
        <section className="info-card reveal-left">
          <h3>
            <i className="fa-regular fa-clock"></i> Horaires d'ouverture
          </h3>
          <ul className="list-info">
            <li>
              <span>Lundi – Vendredi </span>
              <strong className="time-highlight"> 9h00 – 18h30</strong>
            </li>
            <li>
              <span>Samedi</span>
              <span className="status-closed">Fermé</span>
            </li>
            <li>
              <span>Dimanche</span>
              <span className="status-closed">Fermé</span>
            </li>
          </ul>
        </section>

        <section className="info-card reveal-right">
          <h3>
            <i className="fa-solid fa-phone"></i> Contacts
          </h3>
          <ul className="list-info-contacts">
            <li>
              <i className="fa-solid fa-location-dot icon-green"></i>
              <span>ENA, Abomey-Calavi, Bénin</span>
            </li>
            <li>
              <i className="fa-brands fa-whatsapp icon-green"></i>
              <span>
                WhatsApp : <strong>+229 99 90 14 93</strong>
              </span>
            </li>
            <li>
              <i className="fa-regular fa-envelope icon-green"></i>
              <span className="email-text">
                enambeninbibliotheque@gmail.com
              </span>
            </li>
          </ul>
        </section>
      </div>

      <ScrollToTop />
    </div>
  );
}
