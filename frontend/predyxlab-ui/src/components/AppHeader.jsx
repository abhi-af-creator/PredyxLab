import React from "react";
import "./AppHeader.css";

export default function AppHeader() {
  const goToLanding = () => {
    window.location.href =
      "https://calm-meadow-06bb15200.2.azurestaticapps.net";
  };

  return (
    <header className="app-header">
      <h1 className="app-title">PredyxLab</h1>

      <button
        className="app-close-btn"
        onClick={goToLanding}
        title="Back to Landing Page"
        aria-label="Close and return to landing page"
      >
        ✕
      </button>
    </header>
  );
}
