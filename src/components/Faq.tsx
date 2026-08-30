"use client";

import React, { useState } from "react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  icon: string;
}

const faqData: FaqItem[] = [
  {
    id: 1,
    question: "Comment s'enregistrer pour accéder à la salle de la bibliothèque ?",
    answer:
      "Une fois connecté à votre compte, rendez-vous sur votre tableau de bord. Choisissez votre motif de visite (Consultation d'ouvrages, internet, étude, lecture, etc.) et validez. Votre ticket d'entrée sera généré automatiquement.",
    icon: "fa-solid fa-qrcode",
  },
  {
    id: 2,
    question: "Comment déposer un mémoire pour correction ?",
    answer:
      "Sélectionnez le motif 'Dépôt de mémoires' lors de votre enregistrement ou accédez directement à la rubrique Mémoires. Vous pourrez y téléverser votre document PDF pour étude et suivi par nos équipes.",
    icon: "fa-solid fa-file-arrow-up",
  },
  {
    id: 3,
    question: "Quelles sont les ressources documentaires disponibles en ligne ?",
    answer:
      "Notre plateforme intègre des accès directs vers des bases scientifiques partenaires telles que Cairn.info, DICAMES, Google Scholar, Persée, LEGIS et le Secrétariat Général du Gouvernement (SGG).",
    icon: "fa-solid fa-book-bookmark",
  },
  {
    id: 4,
    question: "Dois-je enregistrer ma sortie à la fin de ma visite ?",
    answer:
      "Oui, il est essentiel de cliquer sur le bouton 'Enregistrer ma sortie' présent sur votre ticket actif dans votre tableau de bord afin de libérer votre place et clôturer la session.",
    icon: "fa-solid fa-clock-rotate-left",
  },
  {
    id: 5,
    question: "Qui peut utiliser les services de la bibliothèque ?",
    answer:
      "Les services sont ouverts aussi bien aux étudiants (ENA, FASEG, EPAC, IFRI, etc.) qu'aux enseignants, chercheurs et professionnels ayant un compte SDA actif.",
    icon: "fa-solid fa-user-graduate",
  },
];

export default function Faq() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <h2>Foire Aux Questions</h2>
          <p>Retrouvez les réponses aux questions les plus fréquentes sur nos services.</p>
        </div>

        <div className="faq-list">
          {faqData.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`faq-item ${isOpen ? "active" : ""}`}
                onClick={() => toggleFaq(item.id)}
              >
                <div className="faq-question-box">
                  <div className="faq-question-left">
                    <div className="faq-icon-wrapper">
                      <i className={item.icon}></i>
                    </div>
                    <span className="faq-question-text">{item.question}</span>
                  </div>
                  <button
                    type="button"
                    className="faq-toggle-btn"
                    aria-label="Ouvrir la réponse"
                  >
                    <i className={`fa-solid ${isOpen ? "fa-minus" : "fa-plus"}`}></i>
                  </button>
                </div>

                {isOpen && (
                  <div className="faq-answer-box">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}