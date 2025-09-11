// "use client"

// import { useState } from "react"
// import { Navbar } from "@/src/components/navbar"
// import { Sidebar } from "@/src/components/sidebar"
// import { Dashboard } from "@/src/components/dashboard"
// import { MintTokens } from "@/src/components/mint-tokens"
// import { TransferTokens } from "@/src/components/transfer-tokens"
// import { BurnTokens } from "@/src/components/burn-tokens"
// import { EmergencyControls } from "@/src/components/emergency-controls"
// import { MinterManagement } from "@/src/components/minter-management"
// import { AdminManagement } from "@/src/components/admin-management"
// import { WalletModal } from "@/src/components/wallet-modal"
// import { StatusMessage } from "@/src/components/status-message"
// import { useWeb3 } from "@/src/hooks/use-web3"

// type Section = "dashboard" | "mint" | "transfer" | "burn" | "emergency" | "minterManagement" | "adminManagement"

// export default function TokenLab() {
//   const [activeSection, setActiveSection] = useState<Section>("dashboard")
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [walletModalOpen, setWalletModalOpen] = useState(false)
//   const [statusMessage, setStatusMessage] = useState<{
//     message: string
//     type: "success" | "error" | "info" | "warning"
//   } | null>(null)

//   const web3Context = useWeb3()

//   const showStatus = (message: string, type: "success" | "error" | "info" | "warning") => {
//     setStatusMessage({ message, type })

//     // Auto-hide success/info messages after 6 seconds
//     if (type === "success" || type === "info") {
//       setTimeout(() => {
//         setStatusMessage(null)
//       }, 6000)
//     }
//   }

//   const renderActiveSection = () => {
//     const commonProps = { web3Context, showStatus }

//     switch (activeSection) {
//       case "dashboard":
//         return <Dashboard {...commonProps} />
//       case "mint":
//         return <MintTokens {...commonProps} />
//       case "transfer":
//         return <TransferTokens {...commonProps} />
//       case "burn":
//         return <BurnTokens {...commonProps} />
//       case "emergency":
//         return <EmergencyControls {...commonProps} />
//       case "minterManagement":
//         return <MinterManagement {...commonProps} />
//       case "adminManagement":
//         return <AdminManagement {...commonProps} />
//       default:
//         return <Dashboard {...commonProps} />
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white overflow-x-hidden">
//       <Navbar
//         web3Context={web3Context}
//         onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
//         onConnectWallet={() => setWalletModalOpen(true)}
//         showStatus={showStatus}
//       />

//       <Sidebar
//         isOpen={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//         activeSection={activeSection}
//         onSectionChange={(section) => {
//           setActiveSection(section)
//           setSidebarOpen(false)
//         }}
//       />

//       {sidebarOpen && (
//         <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
//       )}

//       <main className="p-6 md:p-10 max-w-6xl mx-auto">
//         {statusMessage && (
//           <StatusMessage
//             message={statusMessage.message}
//             type={statusMessage.type}
//             onClose={() => setStatusMessage(null)}
//           />
//         )}

//         {renderActiveSection()}
//       </main>

//       <WalletModal
//         isOpen={walletModalOpen}
//         onClose={() => setWalletModalOpen(false)}
//         web3Context={web3Context}
//         showStatus={showStatus}
//       />
//     </div>
//   )
// }




"use client"

import { useState } from "react"
import { Navbar } from "@/src/components/navbar"
import { Sidebar } from "@/src/components/sidebar"
import { Dashboard } from "@/src/components/dashboard"
import { MintTokens } from "@/src/components/mint-tokens"
import { TransferTokens } from "@/src/components/transfer-tokens"
import { BurnTokens } from "@/src/components/burn-tokens"
import { EmergencyControls } from "@/src/components/emergency-controls"
import { MinterManagement } from "@/src/components/minter-management"
import { AdminManagement } from "@/src/components/admin-management"
import { WalletModal } from "@/src/components/wallet-modal"
import { StatusMessage } from "@/src/components/status-message"
import { useWeb3 } from "@/src/hooks/use-web3"

type Section =
  | "dashboard"
  | "mint"
  | "transfer"
  | "burn"
  | "emergency"
  | "minterManagement"
  | "adminManagement"

export default function TokenLab() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    message: string
    type: "success" | "error" | "info" | "warning"
  } | null>(null)

  const web3Context = useWeb3()

  const showStatus = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    setStatusMessage({ message, type })

    if (type === "success" || type === "info") {
      setTimeout(() => {
        setStatusMessage(null)
      }, 6000)
    }
  }

  const handleDisconnectWallet = () => {
    try {
      // clear account state from context
      web3Context.disconnect?.()
      showStatus("Wallet disconnected", "info")
    } catch (err) {
      console.error("Disconnect error:", err)
      showStatus("Failed to disconnect wallet", "error")
    }
  }

  const renderActiveSection = () => {
    const commonProps = { web3Context, showStatus }

    switch (activeSection) {
      case "dashboard":
        return <Dashboard {...commonProps} />
      case "mint":
        return <MintTokens {...commonProps} />
      case "transfer":
        return <TransferTokens {...commonProps} />
      case "burn":
        return <BurnTokens {...commonProps} />
      case "emergency":
        return <EmergencyControls {...commonProps} />
      case "minterManagement":
        return <MinterManagement {...commonProps} />
      case "adminManagement":
        return <AdminManagement {...commonProps} />
      default:
        return <Dashboard {...commonProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white overflow-x-hidden">
      <Navbar
        web3Context={web3Context}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onConnectWallet={() => setWalletModalOpen(true)}
        onDisconnectWallet={handleDisconnectWallet} 
        showStatus={showStatus}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section)
          setSidebarOpen(false)
        }}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="p-6 md:p-10 max-w-6xl mx-auto">
        {statusMessage && (
          <StatusMessage
            message={statusMessage.message}
            type={statusMessage.type}
            onClose={() => setStatusMessage(null)}
          />
        )}

        {renderActiveSection()}
      </main>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        web3Context={web3Context}
        showStatus={showStatus}
      />
    </div>
  )
}
