"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const filieresData: Record<string, string[]> = {
    "ENA": ["AG (Administration Générale)", "AF (Administration des Finances)", "STID (Sciences et Techniques de l'Information et de la Documentation)", "SG (Secrétariat de Gestion)"],
    "FASEG": ["Comptabilité", "Économie", "Gestion des Entreprises", "Finance", "Audit et Contrôle de Gestion", "Marketing", "Gestion des Ressources Humaines"],
    "FLASH": ["Lettres Modernes", "Anglais", "Allemand", "Espagnol", "Géographie", "Histoire", "Sociologie", "Anthropologie", "Psychologie", "Philosophie", "Linguistique"],
    "FADESP": ["Droit Privé", "Droit Public", "Science Politique", "Relations Internationales"],
    "FAST": ["Mathématiques", "Physique", "Chimie", "Biologie", "Biochimie", "Informatique", "Sciences de la Terre"],
    "FSA": ["Agronomie", "Production Végétale", "Production Animale", "Nutrition et Sciences Alimentaires", "Économie Rurale", "Aménagement et Gestion de l'Environnement"],
    "FSS": ["Médecine", "Pharmacie", "Médecine Dentaire"],
    "EPAC": ["Génie Civil", "Génie Électrique", "Génie Mécanique", "Génie Informatique", "Génie Biomédical", "Génie des Procédés", "Maintenance Industrielle", "Télécommunications"],
    "ENEAM": ["Statistique", "Planification", "Analyse Économique", "Informatique de Gestion", "Banque et Finance", "Assurance", "Commerce International", "Marketing", "Gestion des Ressources Humaines", "Entrepreneuriat"],
    "ENSTIC": ["Journalisme", "Communication", "Audiovisuel", "Relations Publiques"],
    "IFRI": ["Génie Logiciel", "Intelligence Artificielle", "Cybersécurité", "Internet et Multimédia", "Systèmes Informatiques", "Réseaux et Télécommunications"],
    "INE": ["Gestion de l'Eau", "Hydrologie", "Hydraulique", "Assainissement"],
    "INMeS": ["Sciences Infirmières", "Sages-Femmes", "Imagerie Médicale", "Kinésithérapie", "Anesthésie-Réanimation"],
    "INJEPS": ["Éducation Physique et Sportive", "Management du Sport", "Loisirs"],
    "INMAAC": ["Archéologie", "Muséologie", "Patrimoine Culturel", "Arts"],
    "IMSP": ["Mathématiques", "Physique"],
    "IGATE": ["Géographie", "Aménagement du Territoire", "Environnement"],
    "FASHS": ["Sociologie", "Anthropologie", "Psychologie"],
    "AUTRE Ecole": ["Autres filières"]
  };

  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState("");
  const [userType, setUserType] = useState("etudiant");
  const [phone, setPhone] = useState("");
  const [selectedEcole, setSelectedEcole] = useState("");
  const [filiere, setFiliere] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          sex,
          userType,
          phone,
          school: userType === "etudiant" ? selectedEcole : undefined,
          filiere: userType === "etudiant" ? filiere : undefined,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Quelque chose a mal tourné.");
      }

      setSuccess(data.message);
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Impossible de se connecter au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Créer un compte</h1>
          <p>Rejoignez la plateforme documentaire du SDA</p>
        </div>

        {error && <div className="auth-error-msg" style={{color: '#e53e3e', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontWeight: '500', fontSize: '0.9rem', border: '1px solid #fed7d7'}}>{error}</div>}
        {success && <div className="auth-success-msg" style={{color: '#38a169', backgroundColor: '#f0fff4', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontWeight: '500', fontSize: '0.9rem', border: '1px solid #c6f6d5'}}>{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><i className="fa-solid fa-user"></i> Nom complet</label>
            <input 
              type="text" 
              placeholder="Ex: John Doe" 
              required 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sexe</label>
              <select required value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="">Choisir...</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Profil</label>
              <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                <option value="etudiant">Étudiant</option>
                <option value="professionnel">Professionnel</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input 
              type="tel" 
              placeholder="Ex: 0199000001" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* S'AFFICHE UNIQUEMENT SI LE PROFIL EST ÉTUDIANT */}
          {userType === "etudiant" && (
            <>
              <div className="form-group">
                <label><i className="fa-solid fa-university"></i> Établissement / École</label>
                <input 
                  type="text"
                  list="schools-list"
                  placeholder="Sélectionnez ou saisissez votre école..."
                  required 
                  value={selectedEcole} 
                  onChange={(e) => {
                    setSelectedEcole(e.target.value);
                    setFiliere("");
                  }}
                />
                <datalist id="schools-list">
                  <option value="ENA" />
                  <option value="FASEG" />
                  <option value="FLASH" />
                  <option value="FAST" />
                  <option value="FSS" />
                  <option value="FADESP" />
                  <option value="ENEAM" />
                  <option value="ENS" />
                  <option value="EPAC" />
                  <option value="IFRI" />
                  <option value="INMeS" />
                  <option value="AUTRE Ecole" />
                </datalist>
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-book"></i> Filière</label>
                <input 
                  type="text"
                  list="filieres-list"
                  placeholder={selectedEcole ? "Sélectionnez ou saisissez votre filière..." : "Saisissez votre filière..."}
                  required 
                  value={filiere}
                  onChange={(e) => setFiliere(e.target.value)}
                />
                <datalist id="filieres-list">
                  {selectedEcole && filieresData[selectedEcole] && 
                    filieresData[selectedEcole].map((item) => (
                      <option key={item} value={item} />
                    ))
                  }
                </datalist>
              </div>
            </>
          )}

          <div className="form-group">
            <label><i className="fa-solid fa-envelope"></i> Email</label>
            <input 
              type="email" 
              placeholder="example@gmail.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label><i className="fa-solid fa-lock"></i> Mot de passe</label>
            <div className="password-input-wrapper" style={{ position: "relative", width: "100%" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="votre mot de passe" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
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

          <button type="submit" className="btn-auth" disabled={isSubmitting}>
            <i className="fa-solid fa-user-plus"></i> {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>

        <p className="auth-footer">
          Déjà inscrit ? <Link href="/login">Connectez-vous ici</Link>
        </p>
      </div>
    </main>
  );
}