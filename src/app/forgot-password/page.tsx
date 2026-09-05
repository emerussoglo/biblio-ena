"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccess("Mot de passe modifié ! Redirection vers la connexion...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Mot de passe oublié</h1>
          <p>{step === 1 ? "Saisissez votre email" : "Entrez le code à 6 chiffres"}</p>
        </div>

        {error && <div className="auth-error-msg" style={{color: '#e53e3e', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '6px', marginBottom: '15px'}}>{error}</div>}
        {success && <div className="auth-success-msg" style={{color: '#38a169', backgroundColor: '#f0fff4', padding: '10px', borderRadius: '6px', marginBottom: '15px'}}>{success}</div>}

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleSendCode}>
            <div className="form-group">
              <label><i className="fa-solid fa-envelope"></i> Email</label>
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? "Envoi du code..." : "Recevoir le code"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label><i className="fa-solid fa-key"></i> Code à 6 chiffres</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
                style={{ letterSpacing: "4px", textAlign: "center", fontSize: "1.2rem" }}
              />
            </div>
            <div className="form-group">
              <label><i className="fa-solid fa-lock"></i> Nouveau mot de passe</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: "15px" }}>
          <Link href="/login">Retour à la connexion</Link>
        </p>
      </div>
    </main>
  );
}