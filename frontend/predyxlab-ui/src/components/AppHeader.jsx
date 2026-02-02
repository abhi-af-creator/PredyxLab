import React from "react";
import "./AppHeader.css";

/**
 * AppHeader
 * ----------
 * Top header for PredyxLab React App
 * Includes:
 *  - App title
 *  - Close / Back to Landing button
 */
function AppHeader() {
  const handleClose = () => {
    const landingUrl = process.env.REACT_APP_LANDING_URL;

    if (!landingUrl) {
      console.error("❌ REACT_APP_LANDING_URL is not defined");
      return;
    }

    // Redirect back to landing page
    window.location.href = landingUrl;
  };

  return (
    <header className="app-header">
      <div className="app-header-left">
        <h1 className="app-title">PredyxLab</h1>
        <span className="app-subtitle">Market Research Lab</span>
      </div>

      <div className="app-header-right">
        <button
          className="close-button"
          onClick={handleClose}
          title="Back to landing page"
        >
          ✕ Close
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
