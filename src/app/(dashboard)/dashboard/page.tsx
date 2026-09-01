"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  fullName: string;
  sex: string;
  school?: string | null;
  phone?: string | null;
  filiere?: string | null;
  role?: string | null;
}

interface VisitTicket {
  ticketNumber: string;
  arrivalAt: string;
  motif: string;
}

export default function DashboardHome() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTicket, setActiveTicket] = useState<VisitTicket | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Dictionnaire des motifs de visite
  const motifLabels: Record<string, string> = {
    consultation_ouvrages: "Consultation d'ouvrages",
    consultation_revues: "Consultation de revues",
    internet: "Consultation internet",
    depot: "Dépôt de mémoires",
    consultation_memoire: "Consultation de mémoire",
    etudes: "Études",
    stage: "Stage",
    lecture: "Lecture",
    // recherche: "Recherche documentaire",
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        // 1. Récupérer le profil utilisateur
        const resProfile = await fetch("/api/auth/me");
        if (!resProfile.ok) throw new Error("Impossible de charger votre profil.");
        const profileData = await resProfile.json();
        setUser(profileData);

        // 2. Récupérer la visite en cours si elle existe
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
  }, []);

  // Action : Enregistrer l'Arrivée
  const handleArrivalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    const motifSelect = document.getElementById("motif") as HTMLSelectElement;
    const selectedMotif = motifSelect.value;

    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motif: selectedMotif }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur de traitement.");

      setActiveTicket({
        ticketNumber: data.ticketNumber,
        arrivalAt: data.arrivalAt,
        motif: motifLabels[data.motif] || data.motif,
      });

      // Redirection automatique si le motif est "Dépôt de mémoires"
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

  // Action : Enregistrer la Sortie
  const handleDepartureClick = async () => {
    setActionLoading(true);
    setError("");

    try {
      const response = await fetch("/api/visits", { method: "PUT" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur de traitement.");

      // Reset de l'état local pour réafficher le formulaire
      setActiveTicket(null);
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", fontWeight: "500", color: "#666" }}>
        Chargement en cours...
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <h1>Enregistrement à l'accueil de la bibliothèque.</h1>
        <p>Votre profil est pré-rempli automatiquement.</p>
      </header>

      {error && (
        <div style={{ color: "#e53e3e", backgroundColor: "#fff5f5", padding: "12px", borderRadius: "6px", border: "1px solid #fed7d7", marginBottom: "15px" }}>
          {error}
        </div>
      )}

      <div className="registration-card">
        {/* Badge des informations utilisateur dynamique */}
        <div className="user-info-badge">
          <div className="info-grid">
            <div className="info-item">
              <span>Nom :</span> <strong>{user?.fullName || "Non renseigné"}</strong>
            </div>
            <div className="info-item">
              <span>Sexe :</span> <strong>{user?.sex === "M" ? "Masculin" : user?.sex === "F" ? "Féminin" : "—"}</strong>
            </div>
            <div className="info-item">
              <span>Statut :</span> <strong>{user?.role === "admin" ? "Administrateur" : user?.school ? "Étudiant" : "Professionnel"}</strong>
            </div>
            <div className="info-item">
              <span>Tél :</span> <strong>{user?.phone || "Non renseigné"}</strong>
            </div>
            {user?.school && (
              <div className="info-item">
                <span>École :</span> <strong>{user.school}</strong>
              </div>
            )}
            {user?.filiere && (
              <div className="info-item-full">
                <span>Filière :</span> <strong>{user.filiere}</strong>
              </div>
            )}
          </div>
        </div>

        {/* CONDITION PRINCIPALE : FORMULAIRE OU TICKET VERT */}
        {!activeTicket ? (
          <form className="visit-form" onSubmit={handleArrivalSubmit}>
            <div className="form-group">
              <label htmlFor="motif">
                Motif de visite <span className="required">*</span> (sélectionnez le motif)
              </label>
              <select id="motif" required defaultValue="consultation_ouvrages">
                <option value="consultation_ouvrages">Consultation d'ouvrages</option>
                <option value="consultation_revues">Consultation de revues</option>
                <option value="internet">Consultation internet</option>
                <option value="consultation_memoire">Consultation de mémoire</option>
                <option value="depot">Dépôt de mémoires</option>
                <option value="etudes">Études</option>
                <option value="stage">Stage</option>
                <option value="lecture">Lecture</option>
                {/* <option value="recherche">Recherche documentaire</option> */}
              </select>
            </div>

            <button type="submit" className="btn-register-visit" disabled={actionLoading}>
              {actionLoading ? "Traitement..." : "Enregistrer mon arrivée"}
            </button>
          </form>
        ) : (
          <div className="ticket-success-view" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
            {/* Rond vert de succès */}
            <div style={{ width: "60px", height: "60px", backgroundColor: "#e6f4ea", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "15px" }}>
              <i className="fa-solid fa-check" style={{ color: "#137333", fontSize: "24px" }}></i>
            </div>

            <h2 style={{ color: "#137333", fontSize: "1.6rem", margin: "0 0 20px 0", fontWeight: "600" }}>Arrivée enregistrée !</h2>

            {/* Carte du ticket de confirmation */}
            <div style={{ backgroundColor: "#f8f9fa", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", width: "100%", maxWidth: "360px", marginBottom: "25px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#137333", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "12px" }}>
                <span>#</span> {activeTicket.ticketNumber}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#5f6368", fontSize: "0.95rem", marginBottom: "12px" }}>
                <i className="fa-regular fa-clock"></i> {activeTicket.arrivalAt}
              </div>
              <div style={{ fontWeight: "600", color: "#202124", fontSize: "1.1rem", marginBottom: "4px" }}>
                {user?.fullName}
              </div>
              <div style={{ color: "#5f6368", fontSize: "0.9rem" }}>
                {activeTicket.motif}
              </div>
            </div>

            {/* Bouton rouge d'enregistrement de la sortie */}
            <button
              onClick={handleDepartureClick}
              disabled={actionLoading}
              style={{ width: "100%", padding: "14px", backgroundColor: "#d93025", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "1rem", cursor: "pointer", transition: "background 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#b31412")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#d93025")}
            >
              {actionLoading ? "Traitement..." : "Enregistrer ma sortie"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}




