"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      setTimeout(() => {
        if (data.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-header">
            {/* <span className="auth-mark">
              <i className="fa-solid fa-book-open-reader"></i>
            </span>
            <p className="auth-eyebrow">Bibliothèque ENA</p> */}
            <h1>Heureux de vous revoir</h1>
            <p>Connectez-vous pour accéder à votre espace personnel.</p>
          </div>

          {error && <div className="auth-error-msg" role="alert">{error}</div>}
          {success && <div className="auth-success-msg" role="status">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label><i className="fa-solid fa-envelope"></i> Email</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <div className="auth-password-label">
                <label><i className="fa-solid fa-lock"></i> Mot de passe</label>
                <Link href="/forgot-password">Mot de passe oublié ?</Link>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  placeholder="Votre mot de passe"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-visibility"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => !loading && setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              <i className="fa-solid fa-right-to-bracket"></i>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <p className="auth-footer">
            Nouveau ici ? <Link href="/register">Créer un compte</Link>
          </p>
        </div>

        <div className="auth-visual" role="img" aria-label="Illustration de la bibliothèque"></div>
      </div>
    </main>
  );
}