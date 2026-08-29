"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "../dashboard.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // États pour le menu utilisateur et les infos utilisateur
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userInitial, setUserInitial] = useState("U"); // "U" par défaut si chargement
  const [userFullName, setUserFullName] = useState("");

  const menuItems = [
    { name: "Accueil", path: "/dashboard", icon: "fa-house" },
    { name: "Catalogue", path: "/catalogue", icon: "fa-book" },
    // { name: "Stats", path: "/stats", icon: "fa-chart-pie" },
    { name: "Profil", path: "/profil", icon: "fa-user" },
    // { name: "Admin", path: "/admin", icon: "fa-user-shield" },
  ];

  // Récupérer le nom de l'utilisateur pour extraire la première lettre
  useEffect(() => {
    const fetchUserInitial = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.fullName) {
            setUserFullName(data.fullName);
            setUserInitial(data.fullName.charAt(0).toUpperCase());
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'initiale :", error);
      }
    };
    fetchUserInitial();
  }, [pathname]);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  // Fermer le menu déroulant si on clique sur un lien du menu
  const closeDropdown = () => setDropdownOpen(false);

  return (
    <div className="dash-container">
      {/* SIDEBAR - Desktop uniquement */}
      <aside className="dash-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon-small"><i className="fa-solid fa-book-bookmark"></i></div>
          <span>Bibliotèque  ENA</span>
        </div>
        <nav className="sidebar-links">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={pathname === item.path ? "active" : ""}
            >
              <i className={`fa-solid ${item.icon}`}></i> {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="dash-main">
        {/* TOPBAR - Desktop & Mobile */}
        <header className="dash-topbar">
          <div className="topbar-title">
             {menuItems.find(i => i.path === pathname)?.name || "Dashboard"}
          </div>
          
          {/* Zone Utilisateur avec Dropdown */}
          <div className="topbar-user-wrapper" style={{ position: "relative" }}>
            <div 
              className="topbar-user" 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              style={{ cursor: "pointer" }}
            >
              <span className="user-initials">{userInitial}</span>
            </div>
 
            {/* Menu Déroulant (Dropdown) */}
            {dropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-user-info">
                  <p className="dropdown-name">{userFullName || "Utilisateur"}</p>
                </div>
                <hr className="dropdown-divider" />
                <Link href="/" className="dropdown-item" onClick={closeDropdown}>
                  <i className="fa-solid fa-house"></i> Page d'accueil
                </Link>
                <Link href="/profil" className="dropdown-item" onClick={closeDropdown}>
                  <i className="fa-solid fa-user"></i> Mon Profil
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
                </button>
              </div>
            )}
          </div>
        </header>

        {/* CONTENU DE LA PAGE */}
        <section className="dash-content">
          {children}
        </section>

        {/* TAB BAR - Mobile uniquement */}
        <nav className="mobile-tabbar">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={pathname === item.path ? "active" : ""}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}