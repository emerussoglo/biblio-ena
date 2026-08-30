export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <p>© {year} ENAM — École Nationale d'Administration</p>
        <span className="footer-separator">•</span>
        <p className="credit-text">
          Conçu par{" "}
          <a
            href="https://emerussoglo.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="designer-link"
          >
            SOGLO Emérus,
          </a>étudiant en STID
        </p>
      </div>
    </footer>
  );
}