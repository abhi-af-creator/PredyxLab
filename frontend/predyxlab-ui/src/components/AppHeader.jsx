import "./AppHeader.css";

export default function AppHeader() {
  const handleClose = () => {
    // HARD-CODED LANDING PAGE (temporary but safe)
    window.location.href =
      "https://calm-meadow-06bb15200.2.azurestaticapps.net";
  };

  return (
    <header className="app-header">
      <h1 className="app-title">PredyxLab</h1>

      <button
        className="close-btn"
        onClick={handleClose}
        title="Back to Landing Page"
      >
        ✕
      </button>
    </header>
  );
}
