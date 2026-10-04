"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  fullName: string;
  sex: string;
  school?: string | null;
  phone?: string | null;
  filiere?: string | null;
  role?: string | null;
  userType?: string | null;
}

interface VisitTicket {
  ticketNumber: string;
  arrivalAt: string;
  motif: string;
}

const motifLabels: Record<string, string> = {
  consultation_ouvrages: "Consultation d'ouvrages",
  consultation_revues: "Consultation de revues",
  internet: "Consultation en ligne",
  depot: "Dépôt de mémoires",
  consultation_memoire: "Consultation de mémoire",
  demande_renseignement: "Demande de renseignement",
  etudes: "Études",
  stage: "Stage",
  lecture: "Lecture",
  recherche: "Recherche documentaire",
};

const motifOptions = [
  { value: "consultation_ouvrages", label: "Consultation d'ouvrages", icon: "fa-book-open" },
  { value: "consultation_revues", label: "Consultation de revues", icon: "fa-newspaper" },
  { value: "internet", label: "Consultation en ligne", icon: "fa-laptop" },
  { value: "consultation_memoire", label: "Consultation de mémoire", icon: "fa-file-lines" },
  { value: "demande_renseignement", label: "Demande de renseignement", icon: "fa-circle-question" },
  { value: "depot", label: "Dépôt de mémoires", icon: "fa-file-arrow-up" },
  { value: "etudes", label: "Études", icon: "fa-graduation-cap" },
  { value: "stage", label: "Stage", icon: "fa-briefcase" },
  { value: "lecture", label: "Lecture", icon: "fa-book-reader" },
  { value: "recherche", label: "Recherche documentaire", icon: "fa-magnifying-glass" },
];

const greetings = [
  { before: 5, after: 12, text: "Bonjour", icon: "fa-sun" },
  { before: 12, after: 18, text: "Bon après-midi", icon: "fa-cloud-sun" },
  { before: 18, after: 24, text: "Bonsoir", icon: "fa-moon" },
  { before: 0, after: 5, text: "Bonsoir", icon: "fa-moon" },
];

export default function DashboardHome() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTicket, setActiveTicket] = useState<VisitTicket | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpenHours, setIsOpenHours] = useState(true);
  const [greeting, setGreeting] = useState(greetings[0]);
  const [motifWheelIndex, setMotifWheelIndex] = useState<number | null>(null);
  const [showMotifWheel, setShowMotifWheel] = useState(false);
  const motifListRef = useRef<HTMLDivElement>(null);

  // État du modal de satisfaction lors de la sortie
  const [showExitModal, setShowExitModal] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [reason, setReason] = useState<string>("");

  const checkWorkingHours = () => {
    const now = new Date();
    const beninTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Africa/Porto-Novo" }),
    );
    const hours = beninTime.getHours();
    const minutes = beninTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Plage : 09:00 (540 min) à 18:30 (1110 min)
    return totalMinutes >= 540 && totalMinutes < 1110;
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setIsOpenHours(checkWorkingHours());
        const beninHour = Number(
          new Intl.DateTimeFormat("en-US", {
            timeZone: "Africa/Porto-Novo",
            hour: "2-digit",
            hourCycle: "h23",
          }).format(new Date()),
        );
        setGreeting(
          greetings.find(
            (period) => beninHour >= period.before && beninHour < period.after,
          ) || greetings[0],
        );

        const resProfile = await fetch("/api/auth/me");
        if (!resProfile.ok)
          throw new Error("Impossible de charger votre profil.");
        const profileData = await resProfile.json();
        setUser(profileData);

        const resVisit = await fetch("/api/visits/current");
        if (resVisit.ok) {
          const visitData = await resVisit.json();
          if (visitData) {
            setActiveTicket({
              ticketNumber: visitData.ticketNumber,
              arrivalAt: visitData.arrivalAt,
              motif: motifLabels[visitData.motif] || visitData.motif,
            });
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Une erreur est survenue lors du chargement.");
        }
      } finally {
        setLoading(false);
      }
    };

    initDashboard();

    const refreshActiveVisit = setInterval(async () => {
      const response = await fetch("/api/visits/current");
      if (response.ok) {
        const visitData = await response.json();
        if (!visitData) setActiveTicket(null);
      }
    }, 60000);

    return () => clearInterval(refreshActiveVisit);
  }, []);

  const handleArrivalSubmit = async (selectedMotif: string) => {
    setActionLoading(true);
    setError("");

    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motif: selectedMotif }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Erreur de traitement.");

      setActiveTicket({
        ticketNumber: data.ticketNumber,
        arrivalAt: data.arrivalAt,
        motif: motifLabels[data.motif] || data.motif,
      });

      if (selectedMotif === "depot") {
        router.push("/memoires");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'enregistrement de l'arrivée.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const rotateMotif = (direction: number) => {
    const next =
      motifWheelIndex === null
        ? direction > 0
        ? 0
        : motifOptions.length - 1
        : (motifWheelIndex + direction + motifOptions.length) % motifOptions.length;
    setMotifWheelIndex(next);
    motifListRef.current
      ?.querySelector<HTMLElement>(`[data-motif-index="${next}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const chooseMotif = (motif: string) => {
    setShowMotifWheel(false);
    void handleArrivalSubmit(motif);
  };

  const handleDepartureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    try {
      const response = await fetch("/api/visits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: rating,
          reason: reason.trim() ? reason : null,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Erreur de traitement.");

      setShowExitModal(false);
      setActiveTicket(null);
      setRating(5);
      setReason("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'enregistrement de la sortie.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontWeight: "500",
          color: "#666",
        }}
      >
        Chargement en cours...
      </div>
    );
  }

  return (
    <div className="welcome-container" style={{ position: "relative" }}>
      <header className="welcome-header welcome-hero">
        {/* <span className="welcome-time">
          <i className={`fa-solid ${greeting.icon}`}></i> {greeting.text}
        </span> */}
        <h1>
          <i className={`fa-solid ${greeting.icon}`} aria-hidden="true"></i>
          <span>{greeting.text}, {user?.fullName || "bienvenue"}</span>
        </h1>
        <p style={{ textAlign: "center", }}>Enregistrement à l&apos;accueil de la bibliothèque.</p>
        <small style={{ textAlign: "center", }}>Votre profil est pré-rempli automatiquement.</small>
      </header>

      {error && (
        <div
          style={{
            color: "#e53e3e",
            backgroundColor: "#fff5f5",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #fed7d7",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      {!isOpenHours && !activeTicket && (
        <div
          style={{
            color: "#c05621",
            backgroundColor: "#feebc8",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #fbd38d",
            marginBottom: "15px",
            fontWeight: "500",
          }}
        >
          Les enregistrements sont fermés. Heures d&apos;ouverture : 09h00 à
          18h30.
        </div>
      )}

      <div className="registration-card">
        {/* Badge utilisateur */}
        <div className="user-info-badge">
          <div className="info-grid">

            <div className="info-item">
        
              <span>Sexe</span>
              <strong>
                {user?.sex === "M"
                  ? "Masculin"
                  : user?.sex === "F"
                    ? "Féminin"
                    : "—"}
              </strong>

            </div>

            <div className="info-item">
             
              <span>Statut</span>
              <strong>
                {user?.role === "admin"
                  ? "Administrateur"
                  : user?.school
                    ? "Étudiant"
                    : "Professionnel"}
              </strong>
            </div>

            <div className="info-item">
              
              <span>Tél</span>
              <strong>{user?.phone || "Non renseigné"}</strong>
            </div>

            <div className="info-item">
              
              <span>École</span> <strong>{user?.school || "—"}</strong>
            </div>
            
            <div className="info-item-full">
              
              <span>Filière</span> <strong>{user?.filiere || "—"}</strong>
            </div>
          </div>
        </div>

        {/* CONDITION PRINCIPALE */}
        {!activeTicket ? (
          <div className="visit-form">
            <div className="motif-picker">
              <button
                type="button"
                className="motif-picker-toggle"
                aria-expanded={showMotifWheel}
                aria-controls={showMotifWheel ? "motif-wheel" : undefined}
                disabled={!isOpenHours || actionLoading}
                onClick={() => {
                  setMotifWheelIndex(0);
                  setShowMotifWheel(true);
                }}
              >
                <span className="motif-current-icon">
                  <i className="fa-solid fa-location-dot"></i>
                </span>
                <span>Choisir un motif de visite</span>
                <i className="fa-solid fa-chevron-down"></i>
              </button>

              {showMotifWheel && (
                <div
                  className="motif-picker-backdrop"
                  onClick={() => setShowMotifWheel(false)}
                >
                  <section
                    className="motif-picker-dialog"
                    id="motif-wheel"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="motif-dialog-title"
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setShowMotifWheel(false);
                      } else if (event.key === "Enter" && motifWheelIndex !== null) {
                        event.preventDefault();
                        chooseMotif(motifOptions[motifWheelIndex].value);
                      }
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="motif-dialog-header">
                      <div>
                        {/* <span className="motif-step">ENREGISTREMENT</span> */}
                        {/* <h2 id="motif-dialog-title">Motif de votre visite</h2> */}
                      </div>
                      <button
                        type="button"
                        className="motif-dialog-close"
                        aria-label="Fermer la liste des motifs"
                        onClick={() => setShowMotifWheel(false)}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>

                    <div className="motif-list-controls">
                      <button
                        type="button"
                        className="motif-wheel-arrow"
                        aria-label="Faire défiler vers le haut"
                        onClick={() => rotateMotif(-1)}
                      >
                        <i className="fa-solid fa-chevron-up"></i>
                      </button>
                      <span>Faites défiler et touchez un motif</span>
                      <button
                        type="button"
                        className="motif-wheel-arrow"
                        aria-label="Faire défiler vers le bas"
                        onClick={() => rotateMotif(1)}
                      >
                        <i className="fa-solid fa-chevron-down"></i>
                      </button>
                    </div>

                    <div
                      className="motif-options-list"
                      ref={motifListRef}
                      role="listbox"
                      aria-label="Choisir un motif de visite"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          rotateMotif(1);
                        } else if (event.key === "ArrowUp") {
                          event.preventDefault();
                          rotateMotif(-1);
                        }
                      }}
                    >
                      {motifOptions.map((option, index) => (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={motifWheelIndex === index}
                          data-motif-index={index}
                          className={`motif-option-card${motifWheelIndex === index ? " is-highlighted" : ""}`}
                          disabled={actionLoading}
                          onClick={() => chooseMotif(option.value)}
                        >
                          <i className={`fa-solid ${option.icon}`} aria-hidden="true"></i>
                          <span>{option.label}</span>
                          <i className="fa-solid fa-arrow-right motif-option-arrow" aria-hidden="true"></i>
                        </button>
                      ))}
                    </div>
                    {actionLoading && (
                      <p className="motif-saving" role="status">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Enregistrement de votre arrivée…
                      </p>
                    )}
                  </section>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className="ticket-success-view"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 0",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#e6f4ea",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <i
                className="fa-solid fa-check"
                style={{ color: "#0e3518", fontSize: "24px" }}
              ></i>
            </div>

            <h2
              style={{
                color: "#0e3518",
                fontSize: "1.6rem",
                margin: "0 0 20px 0",
                fontWeight: "600",
              }}
            >
              Arrivée enregistrée !
            </h2>

            <div
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                width: "100%",
                maxWidth: "360px",
                marginBottom: "25px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#0e3518",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  marginBottom: "12px",
                }}
              >
                <span>#</span> {activeTicket.ticketNumber}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#5f6368",
                  fontSize: "0.95rem",
                  marginBottom: "12px",
                }}
              >
                <i className="fa-regular fa-clock"></i> {activeTicket.arrivalAt}
              </div>
              <div
                style={{
                  fontWeight: "600",
                  color: "#202124",
                  fontSize: "1.1rem",
                  marginBottom: "4px",
                }}
              >
                {user?.fullName}
              </div>
              <div style={{ color: "#5f6368", fontSize: "0.9rem" }}>
                {activeTicket.motif}
              </div>
            </div>

            <button
              onClick={() => setShowExitModal(true)}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#d93025",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Enregistrer ma sortie
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE SATISFACTION (AFFICHÉ LORS DU CLIC SUR SORTIE) */}
      {showExitModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "15px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "1.2rem",
                color: "#0f172a",
                textAlign: "center",
              }}
            >
              Évaluation de votre visite
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#64748b",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Aidez-nous à améliorer le service en donnant votre avis sur
              l&apos;accueil et les prestations.
            </p>

            <form onSubmit={handleDepartureSubmit}>
              {/* Sélecteur d'étoiles */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "2rem",
                      color: star <= rating ? "#f59e0b" : "#cbd5e1",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Champ d'avis / raison d'insatisfaction */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  {rating <= 2
                    ? "Indiquez la raison de votre insatisfaction :"
                    : "Remarques ou suggestions (optionnel) :"}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    rating <= 2
                      ? "Propreté, accueil, disponibilité des livres, etc."
                      : "Avez-vous des suggestions..."
                  }
                  rows={3}
                  required={rating <= 2}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    resize: "none",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#0284c7",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {actionLoading ? "Enregistrement..." : "Valider et Sortir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
