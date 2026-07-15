import React, { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-5 text-[#2C3E50]">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Something went wrong</h1>
          <p className="text-sm text-gray-400 font-medium max-w-md leading-relaxed">
            The application encountered an unexpected error. Please refresh the page or try again.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
