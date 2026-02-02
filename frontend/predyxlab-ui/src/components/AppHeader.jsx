import React from "react";

const LANDING_URL = process.env.REACT_APP_LANDING_URL;

const handleClose = () => {
  if (!LANDING_URL) {
    console.error("REACT_APP_LANDING_URL not defined");
    return;
  }
  window.location.href = LANDING_URL;
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "12px 16px",
  },
  closeBtn: {
    background: "transparent",
    border: "1px solid #475569",
    color: "#e5e7eb",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
  },
};
