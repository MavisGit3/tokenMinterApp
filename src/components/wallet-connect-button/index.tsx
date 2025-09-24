"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/src/hooks/use-web3"

export function WalletConnectButton() {
  const { connectWallet, disconnect, isConnected, userAccount } = useWeb3()
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      await connectWallet()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  if (isConnected && userAccount) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground">
          Connected: {userAccount.slice(0, 6)}...{userAccount.slice(-4)}
        </div>
        <Button onClick={disconnect} variant="outline">
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={handleConnect} disabled={isConnecting} className="bg-green-600 hover:bg-green-700">
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Mobile users:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Open in MetaMask mobile browser</li>
          <li>Or use Trust Wallet browser</li>
          <li>Or use Coinbase Wallet browser</li>
        </ul>
      </div>
    </div>
  )
}
