export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="main-footer">
      <p>© {year} ENAM — École Nationale d'Administration et de Magistrature</p>
    </footer>
  );
}