"use client";

import { useState, useEffect, useCallback } from "react";
import { Crown, User, Shield, ArrowRight } from "lucide-react";
import type { Web3Context } from "@/src/hooks/use-web3";

interface AdminManagementProps {
  web3Context: Web3Context;
  showStatus: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

export function AdminManagement({
  web3Context,
  showStatus,
}: AdminManagementProps) {
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentOwner, setCurrentOwner] = useState<string>("");
  const [loadingOwner, setLoadingOwner] = useState(false);
  const { contract, userAccount, isOwner, web3 } = web3Context;

  const loadOwner = useCallback(async () => {
    if (!contract) return;

    setLoadingOwner(true);
    try {
      const ownerAddr = await contract.methods.owner().call();
      setCurrentOwner(ownerAddr);
    } catch (error) {
      console.error("Error loading owner:", error);
      showStatus("Error loading contract owner", "error");
    } finally {
      setLoadingOwner(false);
    }
  }, [contract, showStatus]);

  const handleTransferOwnership = async () => {
    if (!contract || !userAccount || !web3) {
      showStatus("Please connect your wallet first", "error");
      return;
    }

    if (!isOwner) {
      showStatus("Only the current owner can transfer ownership", "error");
      return;
    }

    if (!newOwnerAddress) {
      showStatus("Please enter a new owner address", "error");
      return;
    }

    if (!web3.utils.isAddress(newOwnerAddress)) {
      showStatus("Invalid address format", "error");
      return;
    }

    if (newOwnerAddress.toLowerCase() === userAccount.toLowerCase()) {
      showStatus("You are already the owner", "warning");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to transfer ownership to ${newOwnerAddress}? This action cannot be undone!`
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      showStatus(
        "Transferring ownership... Please confirm in MetaMask",
        "info"
      );

      const gasEstimate = await contract.methods
        .transferOwnership(newOwnerAddress)
        .estimateGas({
          from: userAccount,
        });

      const result = await contract.methods
        .transferOwnership(newOwnerAddress)
        .send({
          from: userAccount,
          gas: Math.floor(Number(gasEstimate) * 1.2), // ✅ Fixed BigInt issue
        });

      console.log("Transfer ownership transaction result:", result);

      showStatus(
        `Successfully transferred ownership to ${newOwnerAddress}!`,
        "success"
      );
      await loadOwner();
      setNewOwnerAddress("");
    } catch (error: unknown) {
      console.error("Transfer ownership error:", error);
      let errorMessage = "An unexpected error occurred";

      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }

      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: number }).code === 4001
      ) {
        errorMessage = "Transaction rejected by user";
      } else if (errorMessage.includes("revert")) {
        errorMessage = "Contract rejected the transaction (check permissions)";
      }

      showStatus(`Ownership transfer failed: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenounceOwnership = async () => {
    if (!contract || !userAccount) {
      showStatus("Please connect your wallet first", "error");
      return;
    }

    if (!isOwner) {
      showStatus("Only the current owner can renounce ownership", "error");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to renounce ownership? This will make the contract ownerless and cannot be undone!"
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      showStatus("Renouncing ownership... Please confirm in MetaMask", "info");

      const gasEstimate = await contract.methods
        .renounceOwnership()
        .estimateGas({
          from: userAccount,
        });

      const result = await contract.methods.renounceOwnership().send({
        from: userAccount,
        gas: Math.floor(Number(gasEstimate) * 1.2), // Fixed BigInt issue
      });

      console.log("Renounce ownership transaction result:", result);

      showStatus("Successfully renounced ownership!", "success");
      await loadOwner();
    } catch (error: unknown) {
      console.error("Renounce ownership error:", error);
      let errorMessage = "An unexpected error occurred";

      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }

      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: number }).code === 4001
      ) {
        errorMessage = "Transaction rejected by user";
      } else if (errorMessage.includes("revert")) {
        errorMessage = "Contract rejected the transaction";
      }

      showStatus(`Renounce ownership failed: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      loadOwner();
    }
  }, [contract, userAccount, loadOwner]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-10 shadow-2xl">
      <div className="flex items-center gap-4 mb-3">
        <Crown className="w-8 h-8 text-yellow-400" />
        <div className="text-3xl font-extrabold text-white">
          Ownership Management
        </div>
      </div>

      <p className="text-slate-300 text-lg mb-8 leading-relaxed">
        Transfer contract ownership or renounce ownership entirely.
      </p>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8 text-yellow-400">
        <strong>Owner Only Function:</strong> This contract uses single-owner
        permissions. Only the current owner can transfer ownership or renounce
        it entirely.
      </div>

      {/* Current Owner Display */}
      <div className="border border-slate-700 rounded-lg overflow-hidden mb-6">
        <div className="bg-slate-800/60 px-4 py-3 border-b border-slate-700">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Current Owner{" "}
            {loadingOwner && (
              <span className="text-sm text-slate-400">(Loading...)</span>
            )}
          </h4>
        </div>

        <div className="p-4 bg-slate-800/40">
          {currentOwner ? (
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm text-slate-300 break-all">
                {currentOwner}
              </div>
              <div className="flex items-center gap-2">
                {currentOwner.toLowerCase() === userAccount?.toLowerCase() && (
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold uppercase">
                    <User className="w-3 h-3 inline mr-1" />
                    YOU
                  </span>
                )}
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-bold uppercase">
                  <Crown className="w-3 h-3 inline mr-1" />
                  OWNER
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              No owner information available
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-2">
            New Owner Address
          </label>
          <input
            type="text"
            value={newOwnerAddress}
            onChange={(e) => setNewOwnerAddress(e.target.value.trim())}
            placeholder="Enter new owner address (0x...)"
            className="w-full bg-slate-800/80 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all duration-200"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleTransferOwnership}
            disabled={isLoading || !isOwner}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            {isLoading ? "Transferring..." : "Transfer Ownership"}
          </button>

          <button
            onClick={handleRenounceOwnership}
            disabled={isLoading || !isOwner}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg font-semibold hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            {isLoading ? "Renouncing..." : "Renounce Ownership"}
          </button>
        </div>

        {!isOwner && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-center">
            <Shield className="w-5 h-5 inline-block mr-2" />
            <strong>Access Restricted:</strong> Only the contract owner can
            manage ownership.
          </div>
        )}
      </div>
    </div>
  );
}
