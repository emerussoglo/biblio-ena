"use client";

import React, { useState, useEffect } from "react";
import MemoiresListTable, { Memoire } from "./MemoiresListTable";

export default function AdminMemoiresPage() {
  const [memoiresList, setMemoiresList] = useState<Memoire[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

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
    if (!confirm(`Voulez-vous supprimer le mémoire "${title}" ?`)) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/memoires?id=${id}`, { method: "DELETE" });

      if (res.ok) {
        setMemoiresList((prev) => prev.filter((m) => m.id !== id));
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.message || "Erreur lors de la suppression.");
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

  return (
    <div className="admin-memoires-container">
      <div className="admin-page-header">
        <div>
          <h1>Gestion des Mémoires & Quitus</h1>
          <p>Consultez, validez ou demandez des corrections sur les mémoires.</p>
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
        <MemoiresListTable
          memoires={filteredMemoires}
          deletingId={deletingId}
          onDelete={handleDelete}
          onRefresh={fetchMemoires}
          formatSize={formatSize}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}