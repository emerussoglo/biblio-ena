"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "../dashboard.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
   
  // États pour le menu utilisateur et les infos de l'admin
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userInitial, setUserInitial] = useState("A"); // "A" par défaut pour Admin
  const [userFullName, setUserFullName] = useState("");

  const adminMenuItems = [
    { name: "Visites", path: "/admin", icon: "fa-user-shield" },
    { name: "Statistiques", path: "/stats", icon: "fa-chart-pie" },
     { name: "Mémoires", path: "/admin/memoires", icon: "fa-book-open" },
  ];

  // Récupérer le nom de l'admin depuis notre API mutualisée /api/auth/me
  useEffect(() => {
    const fetchAdminInfo = async () => {
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
        console.error("Erreur lors de la récupération des infos admin :", error);
      }
    };
    fetchAdminInfo();
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
      console.error("Erreur lors de la déconnexion admin :", error);
    }
  };

  const closeDropdown = () => setDropdownOpen(false);

  return (
    <div className="dash-container">
      {/* SIDEBAR ADMIN - Desktop uniquement */}
      <aside className="dash-sidebar" >
        <div className="sidebar-header">
          <div className="logo-icon-small" style={{ backgroundColor: "#1a5d2b" }}>
            <i className="fa-solid fa-user-shield" style={{ color: "#fff" }}></i>
          </div>
          <span>SDA Admin</span>
        </div>
        <nav className="sidebar-links" style={{  color: "#000" }}>
          {adminMenuItems.map((item) => (
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
        {/* TOPBAR ADMIN - Desktop & Mobile */}
        <header className="dash-topbar">
          <div className="topbar-title" style={{ fontWeight: "bold" }}>
             {adminMenuItems.find(i => i.path === pathname)?.name || "Administration"}
          </div>
          
          {/* Zone Utilisateur avec Dropdown */}
          <div className="topbar-user-wrapper" style={{ position: "relative" }}>
            <div 
              className="topbar-user" 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              style={{ cursor: "pointer" }}
            >
              <span className="user-initials" >{userInitial}</span>
            </div>
 
            {/* Menu Déroulant (Dropdown) */}
            {dropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-user-info">
                  <p className="dropdown-name">{userFullName || "Administrateur"}</p>
                </div>
                <hr className="dropdown-divider" />
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
          {adminMenuItems.map((item) => (
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