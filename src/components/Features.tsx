"use client";

import React from "react";

interface FeatureItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  badge?: string;
}

const featuresData: FeatureItem[] = [
  {
    id: 1,
    title: "Accès Instantané à la Salle",
    description:
      "Générez votre ticket d'entrée numérique en quelques secondes selon votre motif (Consultation, Étude, Recherche, Stage...) et accédez directement à votre espace de travail.",
    icon: "fa-solid fa-qrcode",
    badge: "Gain de temps",
  },
  {
    id: 2,
    title: "Dépôt de Mémoires Simplifié",
    description:
      "Soumettez facilement vos travaux au format numérique depuis chez vous et suivez l'avancement de leur révision en toute transparence.",
    icon: "fa-solid fa-file-arrow-up",
    badge: "Service en ligne",
  },
  {
    id: 3,
    title: "Bibliothèque Numérique Intégrée",
    description:
      "Accédez gratuitement et en un clic aux meilleures plateformes de recherche académique et juridique : Cairn.info, DICAMES, Google Scholar, Persée, LEGIS et le SGG.",
    icon: "fa-solid fa-book-bookmark",
    badge: "Ressources 24/7",
  },
  {
    id: 4,
    title: "Historique Personnel des Visites",
    description:
      "Retrouvez à tout moment le récapitulatif complet de toutes vos sessions passées, vos dates de passage et vos tickets enregistrés.",
    icon: "fa-solid fa-clock-rotate-left",
    badge: "Suivi Personnel",
  },
];

export default function Features() {
  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <span className="features-subtitle">Plateforme Numérique SDA</span>
          <h2>Fonctionnalités Clés</h2>
          <p>
            Une suite complète d'outils conçus pour simplifier votre accès aux ressources académiques et à la gestion de vos visites.
          </p>
        </div>

        <div className="features-grid">
          {featuresData.map((item) => (
            <div key={item.id} className="feature-card">
              <div className="feature-card-header">
                <div className="feature-icon-box">
                  <i className={item.icon}></i>
                </div>
                {item.badge && <span className="feature-badge">{item.badge}</span>}
              </div>
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-description">{item.description}</p>
              <div className="feature-card-footer">
                {/* <span className="feature-link-text">En savoir plus</span> */}
                {/* <i className="fa-solid fa-arrow-right feature-arrow"></i> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}