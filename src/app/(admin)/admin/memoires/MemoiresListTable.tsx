"use client";

import React, { useState } from "react";

export interface Memoire {
  id: string;
  title: string;
  abstract: string | null;
  year: string | null;
  keywords: string | null;
  fullName: string;
  matricule: string | null;
  filiere: string | null;
  cycle: "I" | "II" | null;
  note: number | null;
  academicYear: string | null;
  regime: "journee" | "soir" | null;
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
  quitusNumber?: string | null;
  defenseDate?: string | null;
  mention?: string | null;
  approvedAt?: string | null;
}

interface MemoiresListTableProps {
  memoires: Memoire[];
  deletingId: string | null;
  onDelete: (id: string, title: string) => void;
  onRefresh: () => void;
  formatSize: (bytes: number) => string;
  formatDate: (dateStr: string) => string;
}

export default function MemoiresListTable({
  memoires,
  deletingId,
  onDelete,
  onRefresh,
  formatSize,
  formatDate,
}: MemoiresListTableProps) {
  const [selectedMemoire, setSelectedMemoire] = useState<Memoire | null>(null);

  // Modale d'approbation (Validation directe)
  const [approvingMemoire, setApprovingMemoire] = useState<Memoire | null>(
    null,
  );
  const [isSubmittingApprove, setIsSubmittingApprove] =
    useState<boolean>(false);

  // Modale de rejet / demande de corrections
  const [rejectingMemoire, setRejectingMemoire] = useState<Memoire | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [isSubmittingReject, setIsSubmittingReject] = useState<boolean>(false);

  // Soumission Validation Quitus
  const handleConfirmApprove = async () => {
    if (!approvingMemoire) return;
    try {
      setIsSubmittingApprove(true);
      const res = await fetch("/api/admin/memoires/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: approvingMemoire.id,
          action: "approve",
        }),
      });

      if (res.ok) {
        setApprovingMemoire(null);
        onRefresh();
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

  // Soumission Rejet / Modifications
  const handleConfirmReject = async () => {
    if (!rejectingMemoire) return;
    try {
      setIsSubmittingReject(true);
      const res = await fetch("/api/admin/memoires/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectingMemoire.id,
          action: "reject",
          rejectionReason,
        }),
      });

      if (res.ok) {
        setRejectingMemoire(null);
        setRejectionReason("");
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.message || "Erreur lors du rejet.");
      }
    } catch (error) {
      console.error("Erreur rejet:", error);
      alert("Une erreur réseau est survenue.");
    } finally {
      setIsSubmittingReject(false);
    }
  };

  return (
    <>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom et prénom</th>
              <th>Titre / Sujet</th>
              <th>Filière</th>
              <th>Cycle</th>
              <th>Note</th>
              <th>Mention</th>
              <th>Régime</th>
              <th>Année</th>
              <th>Date de dépôt</th>
              <th>Fichier</th>
              <th>Statut / Actions</th>
            </tr>
          </thead>
          <tbody>
            {memoires.map((item) => (
              <tr key={item.id}>
                
                <td>
                  <div className="user-cell">
                    <span className="user-name">{item.fullName}</span>
                    {item.matricule && (
                      <span className="user-mat">Mat: {item.matricule}</span>
                    )}
                  </div>
                </td>
                <td className="title-cell">
                  <span className="memoire-title">{item.title}</span>
                </td>
                <td>{item.filiere || "-"}</td>
                <td>{item.cycle || "-"}</td>
                <td>{item.note ?? "-"}/20</td>
                <td>{item.mention || "-"}</td>
                <td>
                  {item.regime === "journee"
                    ? "Journée"
                    : item.regime === "soir"
                      ? "Soir"
                      : "-"}
                </td>
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
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <button
                      className="btn-action view-btn"
                      onClick={() => setSelectedMemoire(item)}
                      title="Voir les détails"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>

                    {item.status === "pending" ? (
                      <>
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
                          onClick={() => setApprovingMemoire(item)}
                          title="Valider et délivrer le Quitus Provisoire"
                        >
                          <i className="fa-solid fa-file-signature"></i> Valider
                        </button>

                        <button
                          className="btn-action reject-btn"
                          style={{
                            backgroundColor: "#ea580c",
                            color: "#fff",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setRejectionReason("");
                            setRejectingMemoire(item);
                          }}
                          title="Notifier pour corrections / rejeter"
                        >
                          <i className="fa-solid fa-triangle-exclamation"></i>
                        </button>
                      </>
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
                        Corrections requises
                      </span>
                    )}

                    <button
                      className="btn-action delete-btn"
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => onDelete(item.id, item.title)}
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

      {/* MODALE DETAILS */}
      {selectedMemoire && (
        <div className="modal-overlay" onClick={() => setSelectedMemoire(null)}>
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
                    <label>Nom et prénom :</label>
                    <p>{selectedMemoire.fullName}</p>
                  </div>
                  <div>
                    <label>Matricule :</label>
                    <p>{selectedMemoire.matricule || "Non renseigné"}</p>
                  </div>
                  <div>
                    <label>Filière :</label>
                    <p>{selectedMemoire.filiere || "Non renseignée"}</p>
                  </div>
                  <div>
                    <label>Cycle :</label>
                    <p>{selectedMemoire.cycle || "Non renseigné"}</p>
                  </div>
                  <div>
                    <label>Note :</label>
                    <p>
                      {selectedMemoire.note ?? "Non renseignée"}
                      {selectedMemoire.note !== null ? "/20" : ""}
                    </p>
                  </div>
                  <div>
                    <label>Mention :</label>
                    <p>{selectedMemoire.mention || "Non renseignée"}</p>
                  </div>
                  <div>
                    <label>Année académique :</label>
                    <p>{selectedMemoire.academicYear || "Non renseignée"}</p>
                  </div>
                  <div>
                    <label>Régime :</label>
                    <p>
                      {selectedMemoire.regime === "journee"
                        ? "Journée"
                        : selectedMemoire.regime === "soir"
                          ? "Soir"
                          : "Non renseigné"}
                    </p>
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
                <h3>Métadonnées</h3>
                <div className="detail-field">
                  <label>Titre :</label>
                  <p className="highlight-text">{selectedMemoire.title}</p>
                </div>
                <div className="detail-field">
                  <label>Résumé :</label>
                  <p className="abstract-text">
                    {selectedMemoire.abstract || "Aucun résumé."}
                  </p>
                </div>
                <div className="detail-grid">
                  <div>
                    <label>Directeur de mémoire:</label>
                    <p>{selectedMemoire.supervisor || "Non renseigné"}</p>
                  </div>
                  <div>
                    <label>Lieu de stage :</label>
                    <p>
                      {selectedMemoire.internshipLocation || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <label>Mots-clés :</label>
                    <p>{selectedMemoire.keywords || "Aucun"}</p>
                  </div>
                </div>
              </div>
              <hr />
              <div className="detail-section">
                <h3>Fichier PDF</h3>
                <div className="file-box">
                  <i className="fa-solid fa-file-pdf pdf-big-icon"></i>
                  <div className="file-details">
                    <span className="file-title">
                      {selectedMemoire.fileName}
                    </span>
                    <span className="file-meta">
                      {formatSize(selectedMemoire.fileSize)}
                    </span>
                  </div>
                  <div className="file-actions">
                    <a
                      href={selectedMemoire.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-file open"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>{" "}
                      Ouvrir
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DE VALIDATION DIRECTE DU QUITUS */}
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
              <h2>Délivrance Quitus Provisoire</h2>
              <button
                className="btn-close"
                onClick={() => setApprovingMemoire(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div
              className="modal-body"
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
                Êtes-vous sûr de vouloir valider le mémoire de{" "}
                <strong>{approvingMemoire.fullName}</strong> ? Le Quitus
                Provisoire lui sera automatiquement transmis par e-mail.
              </p>
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
                  }}
                >
                  {isSubmittingApprove ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    "Valider & Envoyer Mail"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DE REJET / DEMANDE DE CORRECTIONS */}
      {rejectingMemoire && (
        <div
          className="modal-overlay"
          onClick={() => setRejectingMemoire(null)}
        >
          <div
            className="modal-card"
            style={{ maxWidth: "450px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Demande de Corrections</h2>
              <button
                className="btn-close"
                onClick={() => setRejectingMemoire(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div
              className="modal-body"
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
                Précisez les éléments à corriger par{" "}
                <strong>{rejectingMemoire.fullName}</strong> :
              </p>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Exemple : Titre incomplet, manque la signature du président du jury, fichier illisible..."
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => setRejectingMemoire(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={isSubmittingReject}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#ea580c",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {isSubmittingReject ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    "Notifier l'étudiant"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
