"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // État pour afficher/masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) { 
        throw new Error(data.message || "Une erreur est survenue.");
      }

      setSuccess(data.message);

      // Redirection intelligente selon le rôle de l'utilisateur
      setTimeout(() => {
        if (data.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh(); // Force le rafraîchissement pour que le middleware prenne en compte le nouveau cookie
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Connexion</h1>
          <p>Accédez à votre espace personnel</p>
        </div>

        {/* Messages Flash d'état */}
        {error && <div className="auth-error-msg" style={{color: '#e53e3e', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontWeight: '500', fontSize: '0.9rem', border: '1px solid #fed7d7'}}>{error}</div>}
        {success && <div className="auth-success-msg" style={{color: '#38a169', backgroundColor: '#f0fff4', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontWeight: '500', fontSize: '0.9rem', border: '1px solid #c6f6d5'}}>{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><i className="fa-solid fa-envelope"></i> Email</label>
            <input 
              type="text" 
              placeholder="example@gmail.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label><i className="fa-solid fa-lock"></i> Mot de passe</label>
            <div className="password-input-wrapper" style={{ position: "relative", width: "100%" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                placeholder="Votre mot de passe" 
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ width: "100%", paddingRight: "40px" }} // Évite que le texte passe sous l'icône de l'œil
              />
              <span 
                onClick={() => !loading && setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: loading ? "default" : "pointer",
                  color: "#94a3b8",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%"
                }}
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </span>
            </div>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
           <i className="fa-solid fa-right-to-bracket"></i>  {loading ? "Connexion en cours..." : " Se connecter"}
          </button>
        </form>

        <p className="auth-footer">
          Nouveau ici ? <Link href="/register">Créer un compte</Link>
        </p>
      </div>
    </main>
  );
}