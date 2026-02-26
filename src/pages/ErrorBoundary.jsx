import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Crash:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px",
          textAlign: "center",
          color: "#e5e7eb",
          background: "#0f172a",
          minHeight: "100vh"
        }}>
          <h2>⚠️ Something went wrong</h2>
          <p>The system encountered an unexpected issue.</p>
          <button
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              background: "#38bdf8",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer"
            }}
            onClick={this.handleReload}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}