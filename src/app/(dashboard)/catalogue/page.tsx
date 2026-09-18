"use client";
import React, { useState } from "react";

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState("mémoires");

  const tabs = [
    { id: "mémoires", label: "Mémoires", icon: "fa-book-bookmark" },
    { id: "monographies", label: "Monographies", icon: "fa-book-open" },
    { id: "revues", label: "Revues", icon: "fa-file-lines" },
    { id: "cairn-info", label: "Cairn Info", icon: "fa-globe" },
    { id: "epreuves", label: "Épreuves", icon: "fa-file-circle-check" },
    {
      id: "en-ligne",
      label: "Autre Documentation en ligne",
      icon: "fa-laptop-code",
    },
  ];

  const onlineResources = [
    {
      id: 1,
      title: "DICAMES — Archive scientifique",
      img: "/img/dicarmes.png",
      desc: "Archive numérique institutionnelle du CAMES. Diffuse en accès libre la production scientifique des universités africaines.",
      link: "https://dicames.online/",
    },
    {
      id: 2,
      title: "Google Scholar",
      img: "/img/schoolar.jpg",
      desc: "Moteur de recherche académique mondial. Permet de trouver articles, thèses, livres et brevets dans toutes les disciplines.",
      link: "https://scholar.google.com",
    },
    {
      id: 3,
      title: "Persée",
      img: "/img/persee.png",
      desc: "Archives numériques de revues scientifiques françaises en sciences humaines et sociales, en accès entièrement gratuit.",
      link: "https://www.persee.fr/",
    },
    {
      id: 4,
      title: "LEGIS",
      img: "/img/gouv.jpg",
      desc: "Base de données officielle des textes de loi de la République du Bénin, mise en œuvre par le Ministère de la Justice. Accès libre aux normes juridiques en vigueur.",
      link: "https://legis.cdij.bj/",
    },
    {
      id: 5,
      title: "SGG — Secrétariat Général du Gouvernement",
      img: "/img/gouv.jpg",
      desc: "Plateforme officielle de publication des décrets, lois promulguées, ordonnances et comptes rendus du Conseil des Ministres du Bénin.",
      link: "https://sgg.gouv.bj/",
    },
  ];

  const cairnResource = {
    id: "cairn",
    title: "Cairn.info",
    img: "/img/cairn.png",
    desc: "Portail francophone de référence donnant accès à plus de 600 revues et 21 000 ouvrages en sciences humaines et sociales.",
    link: "https://shs.cairn.info/",
  };

  const renderResource = (res: {
    id: string | number;
    title: string;
    img: string;
    desc: string;
    link: string;
  }) => (
    <div key={res.id} className="resource-card">
      <div className="resource-header">
        <div className="resource-img-container">
          <img src={res.img} alt={res.title} className="resource-thumb" />
        </div>
        <h3>{res.title}</h3>
      </div>
      <p className="resource-desc">{res.desc}</p>
      <a
        href={res.link}
        target="_blank"
        rel="noopener noreferrer"
        className="resource-link"
      >
        <i className="fa-solid fa-arrow-up-right-from-square"></i>
        <span>Accéder</span>
      </a>
    </div>
  );

  return (
    <div className="catalogue-container">
      <header className="catalogue-header">
        <h1 className="page-title">Catalogue documentaire</h1>
        <p className="subtitle">Consultez les ressources disponibles au SDA.</p>
      </header>

      {/* Barre d'onglets (Filtres par type) */}
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENU CONDITIONNEL SELON L'ONGLET SÉLECTIONNÉ */}
      {activeTab === "cairn-info" ? (
        <section className="resources-container">
          <div className="resources-grid">{renderResource(cairnResource)}</div>
        </section>
      ) : activeTab === "en-ligne" ? (
        <section className="resources-container">
          <div className="resources-header">
            <p>
              Accédez directement aux principales plateformes de recherche
              académique, scientifique et juridique pour enrichir vos travaux et
              mémoires.
            </p>
          </div>

          <div className="resources-grid">
            {onlineResources.map(renderResource)}
          </div>
        </section>
      ) : (
        <>
          {/* Barre de recherche et filtres secondaires */}
          <div className="search-section">
            <div className="search-bar">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Rechercher titre, auteur, cote..."
              />
            </div>
            <div className="filter-group">
              <select className="select-filter">
                <option>Toutes les années</option>
              </select>
              <select className="select-filter">
                <option>Toutes les filières</option>
              </select>
            </div>
          </div>

          {/* État vide (Aucun document trouvé) */}
          <div className="empty-state">
            <i className="fa-regular fa-file-lines"></i>
            <p>Aucun document trouvé dans cette catégorie.</p>
          </div>
        </>
      )}

      {/* Footer d'action */}
      <footer className="catalogue-footer">
        <button className="btn-report">
          <i className="fa-solid fa-circle-exclamation"></i>
          Signaler un document manquant
        </button>
      </footer>
    </div>
  );
}
