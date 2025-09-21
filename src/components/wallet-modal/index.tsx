// "use client"

// import type React from "react"

// import { X, Wallet, Smartphone, Shield, Lock } from "lucide-react"
// import type { Web3Context } from "@/src/hooks/use-web3"

// interface WalletModalProps {
//   isOpen: boolean
//   onClose: () => void
//   web3Context: Web3Context
//   showStatus: (message: string, type: "success" | "error" | "info" | "warning") => void
// }

// interface WalletOption {
//   id: string
//   name: string
//   description: string
//   icon: React.ComponentType<{ className?: string }>
//   available: boolean
// }

// const walletOptions: WalletOption[] = [
//   {
//     id: "metamask",
//     name: "MetaMask",
//     description: "Browser extension & mobile app",
//     icon: Wallet,
//     available: true,
//   },
//   {
//     id: "walletconnect",
//     name: "WalletConnect",
//     description: "Connect any mobile wallet",
//     icon: Smartphone,
//     available: false,
//   },
//   {
//     id: "coinbase",
//     name: "Coinbase Wallet",
//     description: "Coinbase browser extension",
//     icon: Shield,
//     available: false,
//   },
//   {
//     id: "trustwallet",
//     name: "Trust Wallet",
//     description: "Mobile wallet app",
//     icon: Lock,
//     available: false,
//   },
// ]

// export function WalletModal({ isOpen, onClose, web3Context, showStatus }: WalletModalProps) {
//   const { connectWallet } = web3Context

//   const handleWalletConnect = async (walletId: string) => {
//     if (walletId === "metamask") {
//       try {
//         await connectWallet()
//         showStatus("Successfully connected to MetaMask!", "success")
//         onClose()
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
//         showStatus(`Connection failed: ${errorMessage}`, "error")
//       }
//     } else {
//       showStatus(`${walletOptions.find((w) => w.id === walletId)?.name} integration coming soon!`, "info")
//     }
//   }

//   const isMobile = () => {
//     return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
//         <div className="relative p-6">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
//           >
//             <X className="w-5 h-5" />
//           </button>

//           <div className="text-center mb-6">
//             <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
//             <p className="text-slate-400 text-sm">Choose your preferred wallet to connect</p>
//           </div>

//           <div className="space-y-3">
//             {walletOptions.map((wallet) => {
//               const Icon = wallet.icon
//               return (
//                 <button
//                   key={wallet.id}
//                   onClick={() => handleWalletConnect(wallet.id)}
//                   disabled={!wallet.available}
//                   className={`w-full flex items-center p-4 rounded-xl border transition-all duration-200 ${
//                     wallet.available
//                       ? "bg-slate-800/60 border-slate-700 hover:bg-blue-500/10 hover:border-blue-500/50"
//                       : "bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed"
//                   }`}
//                 >
//                   <div className="w-8 h-8 mr-4 flex items-center justify-center">
//                     <Icon className="w-6 h-6 text-blue-400" />
//                   </div>
//                   <div className="text-left">
//                     <div className="text-white font-semibold">{wallet.name}</div>
//                     <div className="text-slate-400 text-sm">{wallet.description}</div>
//                   </div>
//                   {!wallet.available && (
//                     <div className="ml-auto text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">Soon</div>
//                   )}
//                 </button>
//               )
//             })}
//           </div>

//           {isMobile() && (
//             <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
//               <strong>Mobile detected:</strong> Please open this dApp in your mobile wallet browser or use WalletConnect
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }






"use client"

import type React from "react"

import { X, Wallet, Smartphone } from "lucide-react"
import type { Web3Context } from "@/src/hooks/use-web3"


interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  web3Context: Web3Context
  showStatus: (message: string, type: "success" | "error" | "info" | "warning") => void
}

interface WalletOption {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  available: boolean
  mobileOnly?: boolean
}

const getWalletOptions = (): WalletOption[] => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  return [
    {
      id: "metamask",
      name: "MetaMask",
      description: isMobile ? "Open in MetaMask app browser" : "Browser extension",
      icon: Wallet,
      available: true,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Connect any mobile wallet",
      icon: Smartphone,
      available: true,
    },
    // {
    //   id: "coinbase",
    //   name: "Coinbase Wallet",
    //   description: isMobile ? "Open in Coinbase Wallet app" : "Browser extension",
    //   icon: Shield,
    //   available: !!(window as any).coinbaseWalletExtension || isMobile,
    // },
    // {
    //   id: "trustwallet",
    //   name: "Trust Wallet",
    //   description: "Mobile wallet app",
    //   icon: Lock,
    //   available: !!(window as any).trustWallet || isMobile,
    //   mobileOnly: true,
    // },
  ]
}

export function WalletModal({ isOpen, onClose, web3Context, showStatus }: WalletModalProps) {
  const { connectWallet } = web3Context

  const handleWalletConnect = async (walletId: string) => {
    try {
      if (walletId === "metamask") {
        await connectWallet()
        showStatus("Successfully connected to MetaMask!", "success")
        onClose()
      } else if (walletId === "walletconnect") {
        // For now, show instructions for WalletConnect
        showStatus("WalletConnect: Scan QR code with your mobile wallet app", "info")
        // TODO: Implement actual WalletConnect integration
      } else if (walletId === "coinbase") {
        if (isMobile()) {
          // Deep link to Coinbase Wallet
          const currentUrl = window.location.href
          window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(currentUrl)}`
        } else {
          showStatus("Please install Coinbase Wallet extension", "warning")
        }
      } else if (walletId === "trustwallet") {
        if (isMobile()) {
          // Deep link to Trust Wallet
          const currentUrl = window.location.href
          window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(currentUrl)}`
        } else {
          showStatus("Trust Wallet is only available on mobile", "info")
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      showStatus(`Connection failed: ${errorMessage}`, "error")
    }
  }

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const walletOptions = getWalletOptions()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
            <p className="text-slate-400 text-sm">Choose your preferred wallet to connect</p>
          </div>

          <div className="space-y-3">
            {walletOptions.map((wallet) => {
              const Icon = wallet.icon
              return (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={!wallet.available}
                  className={`w-full flex items-center p-4 rounded-xl border transition-all duration-200 ${
                    wallet.available
                      ? "bg-slate-800/60 border-slate-700 hover:bg-blue-500/10 hover:border-blue-500/50"
                      : "bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="w-8 h-8 mr-4 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">{wallet.name}</div>
                    <div className="text-slate-400 text-sm">{wallet.description}</div>
                  </div>
                  {!wallet.available && (
                    <div className="ml-auto text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                      {wallet.mobileOnly ? "Mobile Only" : "Not Available"}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {isMobile() && (
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
                <strong>Mobile detected:</strong> For best experience:
                <ul className="mt-1 ml-4 list-disc text-xs">
                  <li>Use MetaMask app browser</li>
                  <li>Or tap wallet options above to open in respective apps</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
