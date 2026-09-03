"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuitusSection, { UserQuitus } from "./QuitusPrint";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  school: string;
  filiere: string;
  role?: string;
  userType?: string;
}

interface UserVisit {
  id: string;
  ticketNumber: string;
  motif: string;
  arrivalAt: string;
  departureAt: string | null;
  date: string;
}

export default function ProfilPage() {
  const router = useRouter();

  const filieresData: Record<string, string[]> = {
    ENA: ["AG (Administration Générale)", "AF (Administration des Finances)", "STID (Sciences et Techniques de l'Information et de la Documentation)", "SG (Secrétariat de Gestion)"],
    FASEG: ["Comptabilité", "Économie", "Gestion des Entreprises", "Finance", "Audit et Contrôle de Gestion", "Marketing", "Gestion des Ressources Humaines"],
    FLASH: ["Lettres Modernes", "Anglais", "Allemand", "Espagnol", "Géographie", "Histoire", "Sociologie", "Anthropologie", "Psychologie", "Philosophie", "Linguistique"],
    FADESP: ["Droit Privé", "Droit Public", "Science Politique", "Relations Internationales"],
    FAST: ["Mathématiques", "Physique", "Chimie", "Biologie", "Biochimie", "Informatique", "Sciences de la Terre"],
    FSA: ["Agronomie", "Production Végétale", "Production Animale", "Nutrition et Sciences Alimentaires", "Économie Rurale", "Aménagement et Gestion de l'Environnement"],
    FSS: ["Médecine", "Pharmacie", "Médecine Dentaire"],
    EPAC: ["Génie Civil", "Génie Électrique", "Génie Mécanique", "Génie Informatique", "Génie Biomédical", "Génie des Procédés", "Maintenance Industrielle", "Télécommunications"],
    ENEAM: ["Statistique", "Planification", "Analyse Économique", "Informatique de Gestion", "Banque et Finance", "Assurance", "Commerce International", "Marketing", "Gestion des Ressources Humaines", "Entrepreneuriat"],
    ENSTIC: ["Journalisme", "Communication", "Audiovisuel", "Relations Publiques"],
    IFRI: ["Génie Logiciel", "Intelligence Artificielle", "Cybersécurité", "Internet et Multimédia", "Systèmes Informatiques", "Réseaux et Télécommunications"],
    INE: ["Gestion de l'Eau", "Hydrologie", "Hydraulique", "Assainissement"],
    INMeS: ["Sciences Infirmières", "Sages-Femmes", "Imagerie Médicale", "Kinésithérapie", "Anesthésie-Réanimation"],
    INJEPS: ["Éducation Physique et Sportive", "Management du Sport", "Loisirs"],
    INMAAC: ["Archéologie", "Muséologie", "Patrimoine Culturel", "Arts"],
    IMSP: ["Mathématiques", "Physique"],
    IGATE: ["Géographie", "Aménagement du Territoire", "Environnement"],
    FASHS: ["Sociologie", "Anthropologie", "Psychologie"],
    "AUTRE Ecole": ["Autres filières"],
  };

  const motifLabels: Record<string, string> = {
    consultation_ouvrages: "Consultation d'ouvrages",
    consultation_revues: "Consultation de revues",
    internet: "Consultation internet",
    depot: "Dépôt de mémoires",
    etudes: "Études",
    lecture: "Lecture",
    recherche: "Recherche documentaire",
  };

  const [user, setUser] = useState<UserProfile | null>(null);
  const [historyList, setHistoryList] = useState<UserVisit[]>([]);
  const [selectedEcole, setSelectedEcole] = useState("");
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [quitusList, setQuitusList] = useState<UserQuitus[]>([]);

  useEffect(() => {
    const loadProfilAndHistory = async () => {
      try {
        const responseProfil = await fetch("/api/auth/me");
        if (!responseProfil.ok) throw new Error("Impossible de récupérer les données du profil.");

        const responseQuitus = await fetch("/api/memoires/quitus");
        if (responseQuitus.ok) {
          const dataQuitus: UserQuitus[] = await responseQuitus.json();
          setQuitusList(dataQuitus);
        }

        const dataProfil = await responseProfil.json();
        setUser({
          id: dataProfil.id,
          fullName: dataProfil.fullName,
          email: dataProfil.email || "",
          phone: dataProfil.phone || "",
          school: dataProfil.school || "",
          filiere: dataProfil.filiere || "",
          role: dataProfil.role || "student",
        });

        setPhone(dataProfil.phone || "");
        setSelectedEcole(dataProfil.school || "");
        setSelectedFiliere(dataProfil.filiere || "");

        const responseHistory = await fetch("/api/visits/history");
        if (responseHistory.ok) {
          const dataHistory: UserVisit[] = await responseHistory.json();
          const sortedHistory = dataHistory.sort((a, b) => {
            if (a.date !== b.date) {
              return b.date.localeCompare(a.date);
            }
            return b.arrivalAt.localeCompare(a.arrivalAt);
          });
          setHistoryList(sortedHistory);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erreur de chargement des données.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfilAndHistory();
  }, []);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsUpdating(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone || null,
          school: selectedEcole || null,
          filiere: selectedFiliere || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Une erreur est survenue.");

      setSuccess(data.message);

      if (user) {
        setUser({
          ...user,
          phone: phone,
          school: selectedEcole,
          filiere: selectedFiliere,
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Impossible de mettre à jour le profil.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Erreur déconnexion:", err);
    }
  };

  const formatDate = (isoDate: string) => {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Chargement de votre profil...</div>;
  }

  const isStudent = user?.role !== "admin" && (selectedEcole || user?.school);

  return (
    <div className="profil-container">
      <h1 className="page-title">Mon Profil</h1>

      {error && (
        <div className="auth-error-msg" style={{ color: "#e53e3e", backgroundColor: "#fff5f5", padding: "10px", borderRadius: "6px", marginBottom: "15px", border: "1px solid #fed7d7" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="auth-success-msg" style={{ color: "#38a169", backgroundColor: "#f0fff4", padding: "10px", borderRadius: "6px", marginBottom: "15px", border: "1px solid #c6f6d5" }}>
          {success}
        </div>
      )}

      <div className="profile-card">
        <div className="profile-header-info">
          <div className="avatar-circle">{user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}</div>
          <div>
            <h3>{user?.fullName}</h3>
            <p className="user-email">{user?.email || "Aucun email lié"}</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleUpdateSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 0199000001"
              />
            </div>

            <div className="form-group">
              <label>Établissement / École</label>
              <input
                type="text"
                list="schools-list"
                value={selectedEcole}
                onChange={(e) => {
                  setSelectedEcole(e.target.value);
                  setSelectedFiliere("");
                }}
                placeholder="Ex: ENA, FASEG, FAST..."
                required={!!isStudent}
              />
              <datalist id="schools-list">
                <option value="ENA" />
                <option value="FASEG" />
                <option value="FLASH" />
                <option value="FAST" />
                <option value="FSS" />
                <option value="FADESP" />
                <option value="ENEAM" />
                <option value="EPAC" />
                <option value="IFRI" />
                <option value="INMeS" />
                <option value="AUTRE Ecole" />
              </datalist>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Filière</label>
              <input
                type="text"
                list="filieres-list"
                value={selectedFiliere}
                onChange={(e) => setSelectedFiliere(e.target.value)}
                placeholder="Ex: Comptabilité, Informatique..."
                required={!!isStudent}
              />
              <datalist id="filieres-list">
                {selectedEcole && filieresData[selectedEcole] &&
                  filieresData[selectedEcole].map((item) => (
                    <option key={item} value={item} />
                  ))
                }
              </datalist>
            </div>
          </div>

          <button type="submit" className="btn-update" disabled={isUpdating}>
            {isUpdating ? "Mise à jour..." : "Mettre à jour mon profil"}
          </button>
        </form>
      </div>

      {/* COMPOSANT QUITUS DÉCOUPLÉ */}
      <QuitusSection quitusList={quitusList} />

      {/* TABLEAU HISTORIQUE */}
      <div className="history-card">
        <div className="history-header">
          <h3>Historique des activités</h3>
          <span className="visit-count">{historyList.length} {historyList.length > 1 ? "activités" : "activité"} au total</span>
        </div>

        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Date</th>
                <th>Motif</th>
                <th>Arrivée</th>
                <th>Départ</th>
              </tr>
            </thead>
            <tbody>
              {historyList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "15px" }}>
                    Vous n'avez pas encore enregistré d'activité.
                  </td>
                </tr>
              ) : (
                historyList.map((visite) => (
                  <tr key={visite.id}>
                    <td style={{ fontWeight: "bold", color: "#0284c7" }}>{visite.ticketNumber}</td>
                    <td>{formatDate(visite.date)}</td>
                    <td>{motifLabels[visite.motif] || visite.motif}</td>
                    <td style={{ color: "#16a34a", fontWeight: "500" }}>{visite.arrivalAt}</td>
                    <td>
                      {visite.departureAt ? (
                        <span style={{ color: "#dc2626", fontWeight: "500" }}>{visite.departureAt}</span>
                      ) : (
                        <span style={{ color: "#d97706", backgroundColor: "#fef3c7", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600" }}>
                          En salle
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="logout-section">
        <button onClick={handleLogout} className="btn-logout">
          <i className="fa-solid fa-right-from-bracket"></i> Se déconnecter
        </button>
      </div>
    </div>
  );
}