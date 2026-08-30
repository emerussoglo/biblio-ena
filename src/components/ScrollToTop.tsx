"use client";

import React, { useState, useEffect } from "react";


export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Détecte le défilement de la page
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Remonte en haut de la page avec un effet doux
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      className={`scroll-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Retourner en haut de la page"
    >
      <i className="fa-solid fa-arrow-up"></i>
    </button>
  );
}