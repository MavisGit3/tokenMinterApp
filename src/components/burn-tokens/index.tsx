"use client";

import { useState } from "react";
import { Flame, Trash2 } from "lucide-react";
import type { Web3Context } from "@/src/hooks/use-web3";

interface BurnTokensProps {
  web3Context: Web3Context;
  showStatus: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

export function BurnTokens({ web3Context, showStatus }: BurnTokensProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const { contract, userAccount, contractData, web3, loadContractData } =
    web3Context;

  const handleBurn = async () => {
    if (!contract || !userAccount || !web3) {
      showStatus("Please connect your wallet first", "error");
      return;
    }

    if (!amount) {
      showStatus("Please enter amount to burn", "error");
      return;
    }

    if (Number.parseFloat(amount) <= 0) {
      showStatus("Amount must be greater than 0", "error");
      return;
    }

    if (confirmationText.toLowerCase() !== "burn") {
      showStatus(
        'Please type "BURN" to confirm this irreversible action',
        "error"
      );
      return;
    }

    setIsLoading(true);

    try {
      showStatus("Preparing to burn tokens...", "info");

      const decimals = contractData?.decimals || 18;
      const scaledAmount = BigInt(
        Math.floor(Number(amount) * 10 ** decimals)
      ).toString();

      const balance = await contract.methods.balanceOf(userAccount).call();
      if (BigInt(balance) < BigInt(scaledAmount)) {
        showStatus("Insufficient balance to burn", "error");
        setIsLoading(false);
        return;
      }

      showStatus("Burning tokens... Please confirm in MetaMask", "info");

      const gasEstimate = await contract.methods
        .burn(scaledAmount)
        .estimateGas({
          from: userAccount,
        });

      const result = await contract.methods.burn(scaledAmount).send({
        from: userAccount,
        gas: Math.floor(Number(gasEstimate) * 1.2), // convert BigInt -> Number
      });

      console.log("Burn transaction result:", result);

      showStatus(`Successfully burned ${amount} tokens!`, "success");

      // Reload contract data and clear form
      await loadContractData();
      setAmount("");
      setConfirmationText("");
    } catch (error: unknown) {
      console.error("Burning error:", error);
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (typeof error === "object" && error !== null && "code" in error) {
        const web3Error = error as { code: number; message?: string };
        if (web3Error.code === 4001) {
          errorMessage = "Transaction rejected by user";
        } else if (web3Error.message?.includes("revert")) {
          errorMessage =
            "Contract rejected the transaction (check balance and contract state)";
        }
      }

      showStatus(`Burn failed: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-10 shadow-2xl">
      <div className="flex items-center gap-4 mb-3">
        <Flame className="w-8 h-8 text-red-400" />
        <div className="text-3xl font-extrabold text-white">Burn Tokens</div>
      </div>

      <p className="text-slate-300 text-lg mb-8 leading-relaxed">
        Permanently destroy tokens from your balance to reduce the total supply.
      </p>

      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 text-red-400">
        <strong>Irreversible Action:</strong> Burning tokens permanently removes
        them from circulation and reduces the total supply. This action cannot
        be undone.
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-2">
            Amount to Burn
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to destroy permanently"
            step="0.001"
            min="0"
            className="w-full bg-slate-800/80 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all duration-200"
          />
        </div>

        {contractData && (
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Available Balance</div>
            <div className="text-red-400 text-xl font-bold">
              {contractData.balance} {contractData.symbol}
            </div>
          </div>
        )}

        <div>
          <label className="block text-white font-semibold mb-2">
            Confirmation (Type <span className="text-red-400 font-bold">BURN</span> to confirm)
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type BURN to confirm"
            className="w-full bg-slate-800/80 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all duration-200"
          />
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm">
          <strong>Warning:</strong> This action will permanently reduce the
          total token supply. Make sure you understand the implications before
          proceeding.
        </div>

        <button
          onClick={handleBurn}
          disabled={isLoading || confirmationText.toLowerCase() !== "burn"}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg font-semibold hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          {isLoading ? "Burning..." : "Burn Tokens"}
        </button>
      </div>
    </div>
  );
}
