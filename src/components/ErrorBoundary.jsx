import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = import.meta.env.BASE_URL || "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0e16",
          color: "#e4e8f1",
          fontFamily: "'Inter', system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 8, color: "#c23a3a" }}>
            Crashed.
          </h1>
          <p style={{ color: "#5e6d85", fontSize: 14, marginBottom: 32, maxWidth: 360 }}>
            Something broke. Your save data is fine — this is just a rendering glitch.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: "13px 28px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "#e4e8f1",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
