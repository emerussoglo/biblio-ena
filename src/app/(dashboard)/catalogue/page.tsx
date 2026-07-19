"use client";
import React, { useState } from 'react';

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState('mémoires');

  const tabs = [
    { id: 'mémoires', label: 'Mémoires', icon: 'fa-book-bookmark' },
    { id: 'monographies', label: 'Monographies', icon: 'fa-book-open' },
    { id: 'revues', label: 'Revues', icon: 'fa-file-lines' },
    { id: 'en-ligne', label: 'Documentation en ligne', icon: 'fa-laptop-code' },
  ];

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
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Barre de recherche et filtres secondaires */}
      <div className="search-section">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Rechercher titre, auteur, cote..." />
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
        <p>Aucun document trouvé.</p>
      </div>

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