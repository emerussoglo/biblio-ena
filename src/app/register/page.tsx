"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const filieresData: Record<string, string[]> = {
    
  "CEFORP": [
    "Dynamique de Population et Planification Régionale"
  ],
  "CIFRED": [
    "Hygiène et Santé Publique",
    "Gestion du cadre de vie",
    "Environnement pour le Développement Durable"
  ],
  "ENA": [
    "Administration Générale",
    "Administration des Finances",
    "Secrétariat de Gestion",
    "Sciences et Techniques de l'Information documentaire"
  ],
  "ENATSE": [
    "Santé publique et surveillance épidémiologique"
  ],
  "ENEAM": [
    "Administration des Réseaux informatiques",
    "Analyse Programmation Informatique",
    "Assurance",
    "Banque et Finance de Marché",
    "Banque et Micro Institutions des finances",
    "Marketing et Communication Commerciale",
    "Marketing et Management Commercial",
    "Gestion des Ressources Humaines",
    "Gestion des Transports",
    "Gestion de Logistique",
    "Statistique Économique et Sectorielle",
    "Statistique Démographique et Sociale",
    "Planification et Gestion des Projets",
    "Planification et Économie du Développement Durable",
    "Développement Local et Régional",
    "Gestion Financière et Comptable"
  ],
  "ENS-Porto-Novo": [
    "Histoire et Géographie",
    "Espagnol",
    "Allemand",
    "Anglais",
    "Français",
    "Philosophie"
  ],
  "ENSET": [
    "Comptabilité",
    "Économie",
    "Electrotechnique",
    "Génie Civil",
    "Secrétariat",
    "Mécanique Automobile",
    "Fabrication Industrielle",
    "Économie Familiale et Sociale",
    "Hôtellerie-Restauration",
    "Froid et Climatisation",
    "Electronique",
    "Energies Renouvelables",
    "Production Animale",
    "Production végétale"
  ],
  "ENSPD": [
    "Statistiques Appliquées",
    "Planification et Suivi Evaluation"
  ],
  "ENSTIC": [
    "Journalisme",
    "Métiers de l'Audiovisuel et du Multimédia"
  ],
  "EPA": [
    "Gestion du patrimoine culturel"
  ],
  "EPAC": [
    "Génie Informatique et Télécom",
    "Génie Chimique - procédés",
    "Machinisme Agricole",
    "Génie Biomédical (Maintenance Biomédicale et Hospitalière)"
  ],
  "FA-Parakou": [
    "Sciences et Techniques de Production Végétale",
    "Sciences et Techniques de Production Animale et Halieutique",
    "Aménagement et Gestion des Ressources Naturelles",
    "Sociologie et Economie Rurales",
    "Nutrition et Sciences Agro-alimentaires"
  ],
  "FADESP": [
    "Droit Privé",
    "Droit Public",
    "Sciences Politiques et Relations Internationales"
  ],
  "FASEG": [
    "Sciences Économiques et de Gestion (Tronc commun)",
    "Économétrie et Statistiques Appliquées",
    "Comptabilité",
    "Finance",
    "Marketing",
    "Gestion des Ressources Humaines"
  ],
  "FASEG-Parakou": [
    "Analyse et Politique Économique (APE)",
    "Économie Agricole (EA)",
    "Economie et Finance des Collectivités Locales (EFCL)",
    "Economie Internationales et Finance (EFI)",
    "Entrepreneuriat et Gestion des Entreprises (EGE)",
    "Marketing et Management des Organisations (MMO)",
    "Finance et Comptabilité (FC)"
  ],
  "FASHS": [
    "Géographie et Aménagement du Territéire",
    "Psychologie",
    "Sciences de l'Education et de la Formation",
    "Philosophie",
    "Socio-Anthropologie",
    "Histoire et Archéologie",
    "Psychologie du travail et des Organisations"
  ],
  "FAST": [
    "Sciences de la Vie et de la Terre",
    "Physique-Chimie",
    "Mathématiques Informatique et Applications",
    "Energies Renouvelables et Systèmes Énergétiques",
    "Génétique, Biotechnologies et Ressources Biologiques",
    "Microbiologie et Biotechnologie Alimentaire",
    "Hydrobiologie Appliquée"
  ],
  "FDSP-Parakou": [
    "Droit Privé",
    "Droit Public",
    "Sciences Politiques et Relations Internationales"
  ],
  "FLASH-Adjarra": [
    "Aménagement du Territoire",
    "Socio-Anthropologie",
    "Anglais"
  ],
  "FLASH-Parakou": [
    "Allemand",
    "Anglais",
    "Espagnol",
    "Géographie et Aménagement du Territoire",
    "Sociologie Anthropologie",
    "Lettres Modernes",
    "Langue Arabe"
  ],
  "FLLAC": [
    "Allemand",
    "Anglais",
    "Espagnol",
    "Lettres Modernes",
    "Sciences du Langage et de la Communication"
  ],
  "FM-Parakou": [
    "Médecine Humaine"
  ],
  "FSA": [
    "Sciences et Techniques de Production Végétale",
    "Sciences et Techniques de Production Animale",
    "Aménagement et Gestion des Forêts et Parcours Naturels",
    "Génie Rural, Pêche et Aquaculture",
    "Nutrition et Technologie Alimentaire",
    "Agroéconomie, Sociologie et Vulgarisation Rurales"
  ],
  "FSS": [
    "Médecine Générale",
    "Pharmacie",
    "Kinésithérapie",
    "Assistance sociale",
    "Nutrition et Diététique"
  ],
  "HERCI": [
    "Commerce International",
    "Négoce International",
    "Relations Maritimes Internationales",
    "Gestion des Achats et Logistique International"
  ],
  "IFRI": [
    "Génie Logiciel",
    "Internet et Multimédia",
    "Intelligence artificielle (IA)",
    "Systèmes embarqués et Internet des Objets (SEIoT)",
    "Sécurité Informatique"
  ],
  "IFSIO": [
    "Soins Infirmiers",
    "Soins obstétricaux"
  ],
  "IGATE": [
    "Gestion des changements climatiques et des écosystèmes",
    "Géomatique et Environnement",
    "Planification et Gestion des espaces urbains et ruraux"
  ],
  "ILACI": [
    "Langue Arabe",
    "Culture Islamique",
    "Finance Islamique",
    "Traduction arabe-français"
  ],
  "IMSP": [
    "Mathématiques",
    "Physique",
    "Classes préparatoires MPSI (Mathématiques, Physiques et Science de l'Ingénieur)",
    "Classes préparatoires PCSI (Physiques, Chimie et Science de l'Ingénieur)"
  ],
  "INE": [
    "Hydrologie quantitative et Gestion intégrée des Ressources",
    "Hydrogéologie et Gestion intégrée des Ressources",
    "Ecohydrologie et Gestion intégrée des Ressources",
    "Gestion des crises et risques liés à l'eau et au climat",
    "Hydraulique et Assainissement",
    "Eau Hygiène et Assainissement (EHA)",
    "Génie rural et Maîtrise de l'Eau"
  ],
  "INJEPS": [
    "Education Physique et Sportive",
    "Entrainement Sportif",
    "Développement communautaire",
    "Andragogie",
    "Récréology",
    "Entrepreneuriat social"
  ],
  "INMAAC": [
    "Administration Culturelle",
    "Arts dramatiques",
    "Arts Plastiques",
    "Musique et Musicologie",
    "Cinéma et Audiovisuel"
  ],
  "INMeS": [
    "Sciences Infirmières",
    "Sciences Obstétricales"
  ],
  "INSTI": [
    "Génie Civil",
    "Génie Énergétique (Energies Renouvelables et Systèmes Énergétiques)",
    "Génie Énergétique (Froid et climatisation)",
    "Génie Electrique et Informatique (Informatique et Télécommunications)",
    "Génie Electrique et Informatique (Electronique et Electrotechnique)",
    "Maintenance des Systèmes (Electricité Industrielle et de bâtiments)",
    "Maintenance des Systèmes (Maintenance Industrielle)",
    "Maintenance des Systèmes (Maintenance Automobile)"
  ],
  "Institut Confucius": [
    "Langue Chinoise",
    "Didactique du Chinois"
  ],
  "IRSP": [
    "Santé publique polyvalente"
  ],
  "IUT-Parakou": [
    "Gestion des Banques",
    "Gestion Commerciale",
    "Gestion des Entreprises",
    "Gestion des Transports et Logistiques",
    "Informatique de Gestion",
    "Gestion des Ressources Humaines"
  ],
  "AUTRE Ecole": [
    "Autres filières"
  ]
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
                <select
                  required
                  value={selectedEcole}
                  onChange={(e) => {
                    setSelectedEcole(e.target.value);
                    setFiliere(""); // Réinitialise la filière quand l'école change
                  }}
                >
                  <option value="">Sélectionnez votre école...</option>
                  {Object.keys(filieresData).map((ecoleKey) => (
                    <option key={ecoleKey} value={ecoleKey}>
                      {ecoleKey}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-book"></i> Filière</label>
                <select
                  required
                  disabled={!selectedEcole}
                  value={filiere}
                  onChange={(e) => setFiliere(e.target.value)}
                >
                  <option value="">
                    {selectedEcole 
                      ? "Sélectionnez votre filière..." 
                      : "Veuillez d'abord choisir une école"}
                  </option>
                  {selectedEcole && filieresData[selectedEcole] && (
                    filieresData[selectedEcole].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))
                  )}
                </select>
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