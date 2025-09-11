"use client";

import { useState } from "react";
import { AlertTriangle, Pause, Play, Shield } from "lucide-react";
import type { Web3Context } from "@/src/hooks/use-web3";

interface EmergencyControlsProps {
  web3Context: Web3Context;
  showStatus: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

export function EmergencyControls({
  web3Context,
  showStatus,
}: EmergencyControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<"pause" | "unpause" | null>(null);
  const {
    contract,
    userAccount,
    isOwner,
    isAdmin,
    contractData,
    loadContractData,
  } = web3Context;

  const handlePause = async () => {
    if (!contract || !userAccount) {
      showStatus("Please connect your wallet first", "error");
      return;
    }

    if (!isOwner && !isAdmin) {
      showStatus("Only the owner or admin can pause the contract", "error");
      return;
    }

    if (contractData?.paused) {
      showStatus("Contract is already paused", "warning");
      return;
    }

    if (
      !confirm(
        "⚠️ Are you sure you want to pause the contract? This will halt all token operations."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setAction("pause");

    try {
      showStatus("Preparing to pause contract...", "info");

      showStatus("Pausing contract... Please confirm in MetaMask", "info");

      const gasEstimate = await contract.methods.pause().estimateGas({
        from: userAccount,
      });

      const result = await contract.methods.pause().send({
        from: userAccount,
        gas: Math.floor(Number(gasEstimate) * 1.2), //fixed BigInt issue
      });

      console.log("Pause transaction result:", result);
      showStatus("Contract successfully paused!", "success");
      await loadContractData();
    } catch (error: unknown) {
      console.error("Pause error:", error);
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) errorMessage = error.message;

      if (typeof error === "object" && error !== null && "code" in error) {
        const web3Error = error as { code: number; message?: string };
        if (web3Error.code === 4001) {
          errorMessage = "Transaction rejected by user";
        } else if (web3Error.message?.includes("revert")) {
          errorMessage =
            "Contract rejected the transaction (check permissions)";
        }
      }

      showStatus(`Pause failed: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleUnpause = async () => {
    if (!contract || !userAccount) {
      showStatus("Please connect your wallet first", "error");
      return;
    }

    if (!isOwner && !isAdmin) {
      showStatus("Only the owner or admin can unpause the contract", "error");
      return;
    }

    if (!contractData?.paused) {
      showStatus("Contract is already active", "warning");
      return;
    }

    if (!confirm(" Are you sure you want to resume contract operations?")) {
      return;
    }

    setIsLoading(true);
    setAction("unpause");

    try {
      showStatus("Preparing to resume contract...", "info");
      showStatus("Resuming contract... Please confirm in MetaMask", "info");

      const gasEstimate = await contract.methods.unpause().estimateGas({
        from: userAccount,
      });

      const result = await contract.methods.unpause().send({
        from: userAccount,
        gas: Math.floor(Number(gasEstimate) * 1.2), //fixed BigInt issue
      });

      console.log("Unpause transaction result:", result);
      showStatus("Contract successfully resumed!", "success");
      await loadContractData();
    } catch (error: unknown) {
      console.error("Unpause error:", error);
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) errorMessage = error.message;

      if (typeof error === "object" && error !== null && "code" in error) {
        const web3Error = error as { code: number; message?: string };
        if (web3Error.code === 4001) {
          errorMessage = "Transaction rejected by user";
        } else if (web3Error.message?.includes("revert")) {
          errorMessage =
            "Contract rejected the transaction (check permissions)";
        }
      }

      showStatus(`Unpause failed: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const getStatusDisplay = () => {
    if (!contractData) {
      return {
        text: "Loading...",
        className: "bg-gray-500/20 text-gray-400",
        icon: Shield,
      };
    }

    return contractData.paused
      ? { text: "PAUSED", className: "bg-red-500/20 text-red-400", icon: Pause }
      : {
          text: "ACTIVE",
          className: "bg-green-500/20 text-green-400",
          icon: Play,
        };
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-10 shadow-2xl">
      <div className="flex items-center gap-4 mb-3">
        <AlertTriangle className="w-8 h-8 text-yellow-400" />
        <div className="text-3xl font-extrabold text-white">
          Emergency Controls
        </div>
      </div>

      <p className="text-slate-300 text-lg mb-8 leading-relaxed">
        Emergency functions to pause or resume all contract operations during
        security incidents or maintenance.
      </p>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8 text-yellow-400">
        <strong>Owner/Admin Only Functions:</strong> These controls can halt or
        resume token operations contract-wide.
      </div>

      {/* Current Status Display */}
      <div className="text-center py-6 mb-8">
        <div className="text-slate-400 text-sm mb-3">
          Current Contract Status
        </div>
        <div
          className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg ${statusDisplay.className}`}
        >
          <StatusIcon className="w-6 h-6" />
          <span>{statusDisplay.text}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={handlePause}
          disabled={isLoading || contractData?.paused || (!isOwner && !isAdmin)}
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg font-semibold hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Pause className="w-5 h-5" />
          {isLoading && action === "pause" ? "Pausing..." : "Pause Contract"}
        </button>

        <button
          onClick={handleUnpause}
          disabled={
            isLoading || !contractData?.paused || (!isOwner && !isAdmin)
          }
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {isLoading && action === "unpause"
            ? "Resuming..."
            : "Resume Contract"}
        </button>
      </div>

      {!isOwner && !isAdmin && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-center">
          <Shield className="w-5 h-5 inline-block mr-2" />
          <strong>Access Restricted:</strong> Only contract owners and admins
          can use emergency controls.
        </div>
      )}
    </div>
  );
}
