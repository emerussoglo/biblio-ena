"use client";

import { useEffect, useMemo, useState } from "react";

type Period = "week" | "month" | "year";

interface TrackedUser {
  id: string;
  fullName: string;
  email: string;
  sex: string;
  userType: string;
  role: string;
  phone: string;
  school: string;
  filiere: string;
  createdAt: string;
  visitCount: number;
  lastVisit: string | null;
}

const userTypeLabels: Record<string, string> = {
  etudiant_enam: "Étudiant ENAM",
  etudiant_externe: "Étudiant externe",
  professionnel: "Professionnel",
  chercheur: "Enseignant / Chercheur",
};

const selectStyle: React.CSSProperties = {
  padding: "9px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  color: "#0f172a",
  backgroundColor: "#fff",
};

export default function SuiviPage() {
  const [users, setUsers] = useState<TrackedUser[]>([]);
  const [period, setPeriod] = useState<Period>("week");
  const [search, setSearch] = useState("");
  const [sex, setSex] = useState("all");
  const [onlyFrequent, setOnlyFrequent] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TrackedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/users?period=${period}`);
        if (!response.ok) throw new Error("Impossible de charger les usagers.");
        const data = await response.json();
        setUsers(data.users);
        setError("");
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Erreur de chargement.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [period]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users
      .filter((user) => {
        const searchable = [
          user.fullName,
          user.email,
          user.phone,
          user.school,
          user.filiere,
        ]
          .join(" ")
          .toLowerCase();
        const matchesSearch = !query || searchable.includes(query);
        const matchesSex = sex === "all" || user.sex === sex;
        const matchesFrequent = !onlyFrequent || user.visitCount > 0;
        return matchesSearch && matchesSex && matchesFrequent;
      })
      .sort((a, b) =>
        onlyFrequent
          ? b.visitCount - a.visitCount
          : a.fullName.localeCompare(b.fullName),
      );
  }, [onlyFrequent, search, sex, users]);

  const formatDate = (value: string | null) => {
    if (!value) return "Aucune visite sur la période";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  return (
    <div style={{ padding: "20px" }}>
      <header style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0, color: "#0f172a", fontSize: "24px" }}>
          Suivi des usagers
        </h1>
        <p style={{ margin: "5px 0 0", color: "#64748b" }}>
          Consultez les profils et la fréquentation des usagers.
        </p>
      </header>

      <section
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: "1 1 280px",
            }}
          >
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ color: "#0284c7" }}
            ></i>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un nom, contact, école ou filière"
              style={{ ...selectStyle, width: "100%" }}
            />
          </div>
          <select
            value={sex}
            onChange={(event) => setSex(event.target.value)}
            style={selectStyle}
            aria-label="Filtrer par sexe"
          >
            <option value="all">Tous les sexes</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            style={selectStyle}
            aria-label="Période de fréquentation"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <button
            type="button"
            onClick={() => setOnlyFrequent((current) => !current)}
            style={{
              ...selectStyle,
              cursor: "pointer",
              backgroundColor: onlyFrequent ? "#e0f2fe" : "#fff",
              borderColor: onlyFrequent ? "#0284c7" : "#cbd5e1",
              fontWeight: 600,
            }}
          >
            <i className="fa-solid fa-ranking-star"></i>{" "}
            {onlyFrequent ? "Tous les usagers" : "Usagers les plus fréquents"}
          </button>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: "13px", color: "#64748b" }}>
          {filteredUsers.length} usager(s) affiché(s)
        </p>
      </section>

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "15px",
            color: "#991b1b",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}
      {loading ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>
          Chargement des usagers...
        </p>
      ) : (
        <section
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "700px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                <th style={cellStyle}>Usager</th>
                <th style={cellStyle}>Contact</th>
                <th style={cellStyle}>Sexe</th>
                <th style={cellStyle}>Visites</th>
                <th style={cellStyle}>Dernière visite</th>
                <th style={cellStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={cellStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span style={avatarStyle}>
                        {user.fullName.trim().charAt(0).toUpperCase() || "?"}
                      </span>
                      <strong>{user.fullName}</strong>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    {user.phone}
                    <br />
                    <small style={{ color: "#64748b" }}>{user.email}</small>
                  </td>
                  <td style={cellStyle}>
                    {user.sex === "F" ? "Féminin" : "Masculin"}
                  </td>
                  <td
                    style={{ ...cellStyle, fontWeight: 700, color: "#0284c7" }}
                  >
                    {user.visitCount}
                  </td>
                  <td style={cellStyle}>{formatDate(user.lastVisit)}</td>
                  <td style={cellStyle}>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      style={detailButtonStyle}
                    >
                      <i className="fa-solid fa-eye"></i> Détail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <p
              style={{ padding: "30px", textAlign: "center", color: "#64748b" }}
            >
              Aucun usager ne correspond aux critères.
            </p>
          )}
        </section>
      )}

      {selectedUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-detail-title"
          onClick={() => setSelectedUser(null)}
          style={overlayStyle}
        >
          <div onClick={(event) => event.stopPropagation()} style={modalStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <h2
                id="user-detail-title"
                style={{ margin: 0, color: "#0f172a", fontSize: "20px" }}
              >
                Détail de l&apos;usager
              </h2>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setSelectedUser(null)}
                style={closeButtonStyle}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <span
                style={{
                  ...avatarStyle,
                  width: "52px",
                  height: "52px",
                  fontSize: "22px",
                }}
              >
                {selectedUser.fullName.trim().charAt(0).toUpperCase()}
              </span>
              <div>
                <h3 style={{ margin: 0 }}>{selectedUser.fullName}</h3>
                <span style={{ color: "#64748b" }}>
                  {userTypeLabels[selectedUser.userType] ||
                    selectedUser.userType}
                </span>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "12px",
              }}
            >
              {[
                ["Email", selectedUser.email],
                ["Téléphone", selectedUser.phone],
                ["Sexe", selectedUser.sex === "F" ? "Féminin" : "Masculin"],
                ["École", selectedUser.school],
                ["Filière", selectedUser.filiere],
                ["Date d'inscription", formatDate(selectedUser.createdAt)],
                ["Visites sur la période", String(selectedUser.visitCount)],
                ["Dernière visite", formatDate(selectedUser.lastVisit)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "6px",
                  }}
                >
                  <small
                    style={{
                      display: "block",
                      color: "#64748b",
                      marginBottom: "3px",
                    }}
                  >
                    {label}
                  </small>
                  <strong style={{ color: "#1e293b" }}>{value}</strong>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              style={{ ...detailButtonStyle, marginTop: "20px", width: "100%" }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  padding: "12px",
  color: "#1e293b",
  fontSize: "13px",
};
const avatarStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#dbeafe",
  color: "#1d4ed8",
  fontWeight: 700,
};
const detailButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "6px",
  padding: "8px 12px",
  backgroundColor: "#0284c7",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};
const closeButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#64748b",
  fontSize: "20px",
  cursor: "pointer",
};
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  backgroundColor: "rgba(15, 23, 42, 0.58)",
};
const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "650px",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: "22px",
  borderRadius: "10px",
  backgroundColor: "#fff",
  boxShadow: "0 20px 50px rgba(0,0,0,.2)",
};
