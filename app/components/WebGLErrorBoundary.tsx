import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

export class WebGLErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode, fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
    this.handleContextLost = this.handleContextLost.bind(this);
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("WebGL Canvas Error:", error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener("webglcontextlost", this.handleContextLost, true);
  }

  componentWillUnmount() {
    window.removeEventListener("webglcontextlost", this.handleContextLost, true);
  }

  handleContextLost(e: Event) {
    e.preventDefault();
    console.warn("WebGL context lost caught by ErrorBoundary.");
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
