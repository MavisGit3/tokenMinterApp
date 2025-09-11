"use client"

import { X } from "lucide-react"

interface StatusMessageProps {
  message: string
  type: "success" | "error" | "info" | "warning"
  onClose: () => void
}

export function StatusMessage({ message, type, onClose }: StatusMessageProps) {
  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500/15 text-green-400 border-green-500/30"
      case "error":
        return "bg-red-500/15 text-red-400 border-red-500/30"
      case "info":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30"
      case "warning":
        return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/15 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className={`p-4 rounded-lg border mb-6 flex items-center justify-between ${getStyles()}`}>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 hover:bg-white/10 rounded transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
