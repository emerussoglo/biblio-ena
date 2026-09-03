"use client";

import React, { useState, useEffect } from "react";

interface Memoire {
  id: string;
  title: string;
  abstract: string | null;
  year: string | null;
  keywords: string | null;
  fullName: string;
  matricule: string | null;
  filiere: string | null;
  academicYear: string | null;
  supervisor: string | null;
  internshipLocation: string | null;
  email: string | null;
  phone: string | null;
  submissionDate: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  // À AJOUTER :
  quitusNumber?: string | null;
  defenseDate?: string | null;
  mention?: string | null;
  approvedAt?: string | null;
}

export default function AdminMemoiresPage() {
  const [memoiresList, setMemoiresList] = useState<Memoire[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMemoire, setSelectedMemoire] = useState<Memoire | null>(null);


  // Récupération des mémoires
  useEffect(() => {
    fetchMemoires();
  }, []);

  const fetchMemoires = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/memoires");
      if (res.ok) {
        const data = await res.json();
        setMemoiresList(data);
      } else {
        console.error("Erreur serveur lors de la récupération des mémoires");
      }
    } catch (err) {
      console.error("Erreur chargement mémoires:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `Voulez-vous vraiment supprimer le mémoire "${title}" ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);

      const res = await fetch(`/api/admin/memoires?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMemoiresList((prev) => prev.filter((m) => m.id !== id));
        if (selectedMemoire?.id === id) {
          setSelectedMemoire(null);
        }
      } else {
        const text = await res.text();
        let errorMessage = "Erreur lors de la suppression.";
        try {
          const errData = JSON.parse(text);
          errorMessage = errData.message || errorMessage;
        } catch {
          errorMessage = `Erreur ${res.status}: ${res.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert("Une erreur réseau est survenue.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMemoires = memoiresList.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(term) ||
      item.fullName?.toLowerCase().includes(term) ||
      (item.filiere && item.filiere.toLowerCase().includes(term)) ||
      (item.matricule && item.matricule.toLowerCase().includes(term))
    );
  });

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Mo";
    return (bytes / (1024 * 1024)).toFixed(2) + " Mo";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };




// États pour la modale
const [approvingMemoire, setApprovingMemoire] = useState<Memoire | null>(null);
const [mentionInput, setMentionInput] = useState<string>("Très Bien");
const [isSubmittingApprove, setIsSubmittingApprove] = useState<boolean>(false);

const handleConfirmApprove = async () => {
  if (!approvingMemoire) return;

  try {
    setIsSubmittingApprove(true);
    const res = await fetch("/api/admin/memoires/approve", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: approvingMemoire.id,
        mention: mentionInput,
        action: "approve",
      }),
    });

    if (res.ok) {
      setApprovingMemoire(null);
      fetchMemoires();
    } else {
      const err = await res.json();
      alert(err.message || "Erreur lors de la validation.");
    }
  } catch (error) {
    console.error("Erreur validation:", error);
    alert("Une erreur réseau est survenue.");
  } finally {
    setIsSubmittingApprove(false);
  }
};




  return (
    <div className="admin-memoires-container">
      <div className="admin-page-header">
        <div>
          <h1>Gestion des Mémoires</h1>
          <p>Consultez et gérez les mémoires déposés par les étudiants.</p>
        </div>
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher par titre, nom, filière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Chargement des mémoires...</p>
        </div>
      ) : filteredMemoires.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-folder-open"></i>
          <p>Aucun mémoire trouvé.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre / Sujet</th>
                <th>Étudiant</th>
                <th>Filière</th>
                <th>Année</th>
                <th>Date de dépôt</th>
                <th>Fichier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemoires.map((item) => (
                <tr key={item.id}>
                  <td className="title-cell">
                    <span className="memoire-title">{item.title}</span>
                  </td>
                  <td>
                    <div className="user-cell">
                      <span className="user-name">{item.fullName}</span>
                      {item.matricule && (
                        <span className="user-mat">Mat: {item.matricule}</span>
                      )}
                    </div>
                  </td>
                  <td>{item.filiere || "-"}</td>
                  <td>{item.year || "-"}</td>
                  <td>{formatDate(item.submissionDate || item.createdAt)}</td>
                  <td>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-link"
                      title={item.fileName}
                    >
                      <i className="fa-solid fa-file-pdf"></i>
                      <span>{formatSize(item.fileSize)}</span>
                    </a>
                  </td>
                  <td>
  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
    <button
      className="btn-action view-btn"
      onClick={() => setSelectedMemoire(item)}
      title="Voir les détails"
    >
      <i className="fa-solid fa-eye"></i> Détails
    </button>

    {item.status === "pending" ? (
      <button
        className="btn-action approve-btn"
        style={{
          backgroundColor: "#16a34a",
          color: "#fff",
          border: "none",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
        onClick={() => {
          setMentionInput("Très Bien");
          setApprovingMemoire(item);
        }}
        title="Valider et générer le quitus"
      >
        <i className="fa-solid fa-file-signature"></i> Valider Quitus
      </button>
    ) : item.status === "approved" ? (
      <span
        style={{
          backgroundColor: "#dcfce7",
          color: "#15803d",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "0.8rem",
          fontWeight: "bold",
        }}
      >
        {item.quitusNumber || "Validé"}
      </span>
    ) : (
      <span
        style={{
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "0.8rem",
          fontWeight: "bold",
        }}
      >
        Rejeté
      </span>
    )}

    <button
      className="btn-action delete-btn"
      style={{
        backgroundColor: "#dc2626",
        color: "#fff",
        border: "none",
        padding: "6px 12px",
        borderRadius: "4px",
        cursor: "pointer",
      }}
      onClick={() => handleDelete(item.id, item.title)}
      disabled={deletingId === item.id}
      title="Supprimer"
    >
      {deletingId === item.id ? (
        <i className="fa-solid fa-spinner fa-spin"></i>
      ) : (
        <i className="fa-solid fa-trash"></i>
      )}
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALE DE DÉTAILS DU MÉMOIRE */}
      {selectedMemoire && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedMemoire(null)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails du mémoire</h2>
              <button
                className="btn-close"
                onClick={() => setSelectedMemoire(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Informations Académiques</h3>
                <div className="detail-grid">
                  <div>
                    <label>Étudiant :</label>
                    <p>{selectedMemoire.fullName}</p>
                  </div>
                  <div>
                    <label>Matricule :</label>
                    <p>{selectedMemoire.matricule || "Non renseigné"}</p>
                  </div>
                  <div>
                    <label>Filière / Spécialité :</label>
                    <p>{selectedMemoire.filiere || "Non renseignée"}</p>
                  </div>
                  <div>
                    <label>Année académique :</label>
                    <p>{selectedMemoire.academicYear || "Non renseignée"}</p>
                  </div>
                  <div>
                    <label>Email :</label>
                    <p>{selectedMemoire.email || "Non renseigné"}</p>
                  </div>
                  <div>
                    <label>Téléphone :</label>
                    <p>{selectedMemoire.phone || "Non renseigné"}</p>
                  </div>
                </div>
              </div>

              <hr />

              <div className="detail-section">
                <h3>Métadonnées du Mémoire</h3>
                <div className="detail-field">
                  <label>Titre :</label>
                  <p className="highlight-text">{selectedMemoire.title}</p>
                </div>
                <div className="detail-field">
                  <label>Résumé (Abstract) :</label>
                  <p className="abstract-text">
                    {selectedMemoire.abstract || "Aucun résumé fourni."}
                  </p>
                </div>
                <div className="detail-grid">
                  <div>
                    <label>Directeur de mémoire :</label>
                    <p>{selectedMemoire.supervisor || "Non renseigné"}</p>
                  </div>
                  <div>
                    <label>Lieu de stage :</label>
                    <p>
                      {selectedMemoire.internshipLocation || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <label>Année de soutenance :</label>
                    <p>{selectedMemoire.year || "Non renseignée"}</p>
                  </div>
                  <div>
                    <label>Mots-clés :</label>
                    <p>{selectedMemoire.keywords || "Aucun"}</p>
                  </div>
                </div>
              </div>

              <hr />

              <div className="detail-section">
                <h3>Fichier Téléversé</h3>
                <div className="file-box">
                  <i className="fa-solid fa-file-pdf pdf-big-icon"></i>
                  <div className="file-details">
                    <span className="file-title">
                      {selectedMemoire.fileName}
                    </span>
                    <span className="file-meta">
                      Taille: {formatSize(selectedMemoire.fileSize)} | Déposé le:{" "}
                      {formatDate(
                        selectedMemoire.submissionDate ||
                          selectedMemoire.createdAt
                      )}
                    </span>
                  </div>
                  <div className="file-actions">
                    {/* BOUTON OUVRIR DANS UN NOUVEL ONGLET */}
                    <a
                      href={selectedMemoire.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-file open"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Ouvrir
                    </a>

                    {/* BOUTON TÉLÉCHARGER RÉINTÉGRÉ */}
                    <a
                      href={selectedMemoire.fileUrl}
                      download={selectedMemoire.fileName || "memoire.pdf"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-file download"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        textDecoration: "none",
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        fontSize: "14px",
                      }}
                    >
                      <i className="fa-solid fa-download"></i> Télécharger
                    </a>

                    {/* BOUTON SUPPRIMER */}
                    <button
                      className="btn-file delete"
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleDelete(selectedMemoire.id, selectedMemoire.title)
                      }
                      disabled={deletingId === selectedMemoire.id}
                    >
                      {deletingId === selectedMemoire.id ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fa-solid fa-trash"></i>
                      )}{" "}
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

   {/* MODALE DE VALIDATION DU QUITUS */}
{approvingMemoire && (
  <div
    className="modal-overlay"
    onClick={() => setApprovingMemoire(null)}
  >
    <div
      className="modal-card"
      style={{ maxWidth: "450px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <h2>Validation du Quitus</h2>
        <button
          className="btn-close"
          onClick={() => setApprovingMemoire(null)}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
          Vous êtes sur le point d'approuver le mémoire de <strong>{approvingMemoire.fullName}</strong>.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontWeight: "600", fontSize: "13px" }}>Mention attribuée :</label>
          <select
            value={mentionInput}
            onChange={(e) => setMentionInput(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
            }}
          >
            <option value="Passable">Passable</option>
            <option value="Assez Bien">Assez Bien</option>
            <option value="Bien">Bien</option>
            <option value="Très Bien">Très Bien</option>
            <option value="Excellent">Excellent</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <button
            onClick={() => setApprovingMemoire(null)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>

          <button
            onClick={handleConfirmApprove}
            disabled={isSubmittingApprove}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#16a34a",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isSubmittingApprove ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-check"></i>
            )}
            Confirmer et Générer Quitus
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}