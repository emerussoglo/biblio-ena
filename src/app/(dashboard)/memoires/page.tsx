"use client";

import React, { useState } from "react";

export default function SubmitMemoirePage() {
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    year: "2026",
    keywords: "",
    fullName: "", // Nom et Prénom unifiés
    matricule: "",
    filiere: "",
    academicYear: "2025-2026",
    supervisor: "",
    internshipLocation: "",
    email: "",
    phone: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; msg: string }>({
    type: "",
    msg: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setStatus({ type: "error", msg: "Seuls les fichiers au format PDF sont acceptés." });
        return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) {
        setStatus({ type: "error", msg: "La taille du fichier ne doit pas dépasser 20 Mo." });
        return;
      }
      setFile(selectedFile);
      setStatus({ type: "", msg: "" });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" && droppedFile.size <= 20 * 1024 * 1024) {
        setFile(droppedFile);
        setStatus({ type: "", msg: "" });
      } else {
        setStatus({ type: "error", msg: "Fichier invalide (PDF uniquement, max 20 Mo)." });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus({ type: "error", msg: "Veuillez joindre le fichier PDF de votre mémoire." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", msg: "" });

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      payload.append("file", file);

      const res = await fetch("/api/memoires", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur s'est produite.");
      }

      setStatus({
        type: "success",
        msg: "Votre mémoire a été déposé avec succès ! Un récépissé (quitus) a été généré.",
      });

      // Réinitialisation du formulaire
      setFormData({
        title: "",
        abstract: "",
        year: "2026",
        keywords: "",
        fullName: "",
        matricule: "",
        filiere: "",
        academicYear: "2025-2026",
        supervisor: "",
        internshipLocation: "",
        email: "",
        phone: "",
      });
      setFile(null);
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message || "Impossible d'envoyer le formulaire." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="submit-memoire-wrapper">
      <div className="submit-header">
        <h1>Dépôt de mémoire en ligne</h1>
        <p>Renseignez les métadonnées et téléversez votre travail au format PDF (max. 20 Mo).</p>
      </div>

      {status.msg && (
        <div className={`status-banner ${status.type}`}>
          <i className={status.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation"}></i>
          <span>{status.msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="submit-form">
        {/* SECTION 1 : Métadonnées du mémoire */}
        <section className="form-card">
          <div className="card-title">
            <span className="step-num">1</span>
            <div>
              <h2>Métadonnées du mémoire</h2>
              <p>Informations relatives à votre sujet d'étude</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title">
                Titre du mémoire <span className="req">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Ex: Analyse de la gouvernance des bibliothèques universitaires..."
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="abstract">Résumé (Abstract)</label>
              <textarea
                id="abstract"
                name="abstract"
                rows={4}
                placeholder="Présentez brièvement le contexte, la problématique et les résultats clés..."
                value={formData.abstract}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="year">Année de soutenance</label>
              <input
                type="text"
                id="year"
                name="year"
                placeholder="ex. 2026"
                value={formData.year}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="keywords">Mots-clés</label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                placeholder="Séparés par des virgules (ex: Archivage, Numérique, ENA)"
                value={formData.keywords}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* SECTION 2 : Informations étudiant & Encadrement */}
        <section className="form-card">
          <div className="card-title">
            <span className="step-num">2</span>
            <div>
              <h2>Informations de l'étudiant</h2>
              <p>Vos coordonnées et détails académiques</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="fullName">
                Nom et Prénom <span className="req">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Ex: SOGLO Emérus"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="matricule">Matricule</label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                placeholder="Ex: 12345612"
                value={formData.matricule}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="filiere">Filière / Spécialité</label>
              <input
                type="text"
                id="filiere"
                name="filiere"
                placeholder="Ex: Administration Générale"
                value={formData.filiere}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="academicYear">Année académique</label>
              <input
                type="text"
                id="academicYear"
                name="academicYear"
                placeholder="ex. 2025-2026"
                value={formData.academicYear}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="supervisor">Directeur de mémoire</label>
              <input
                type="text"
                id="supervisor"
                name="supervisor"
                placeholder="Ex: Dr. SOSSOU Koffi"
                value={formData.supervisor}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="internshipLocation">Lieu de stage</label>
              <input
                type="text"
                id="internshipLocation"
                name="internshipLocation"
                placeholder="Ex: Ministère de l'Économie et des Finances"
                value={formData.internshipLocation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email étudiant</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="ex. etudiant@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
              <span className="field-hint">Une copie du quitus sera envoyée à cette adresse.</span>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone (WhatsApp)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="ex. +229 01 41 51 63 89"
                value={formData.phone}
                onChange={handleChange}
              />
              <span className="field-hint">Pour la réception du lien par message.</span>
            </div>
          </div>
        </section>

        {/* SECTION 3 : Téléversement du document */}
        <section className="form-card">
          <div className="card-title">
            <span className="step-num">3</span>
            <div>
              <h2>Fichier du mémoire</h2>
              <p>Joignez le document au format PDF</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>
                Mémoire numérique (PDF uniquement, max 20 Mo) <span className="req">*</span>
              </label>

              <div
                className={`dropzone ${dragActive ? "active" : ""} ${file ? "file-selected" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="file-input-hidden"
                />

                {!file ? (
                  <label htmlFor="pdf-upload" className="dropzone-label">
                    <div className="upload-icon">
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <p className="drop-title">
                      <span>Cliquez pour parcourir</span> ou glissez-déposez le PDF ici
                    </p>
                    <p className="drop-sub">Taille maximale : 20 Mo</p>
                  </label>
                ) : (
                  <div className="selected-file-card">
                    <i className="fa-solid fa-file-pdf pdf-icon"></i>
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} Mo</span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-file"
                      onClick={() => setFile(null)}
                      title="Supprimer"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit-memoire" disabled={isSubmitting}>
              <i className="fa-solid fa-paper-plane"></i>
              {isSubmitting ? "Envoi en cours..." : "Déposer le mémoire"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}