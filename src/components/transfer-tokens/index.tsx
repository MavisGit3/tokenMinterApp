"use client";

import { useState } from "react";
import { Send, ArrowRight } from "lucide-react";
import type { Web3Context } from "@/src/hooks/use-web3";

interface TransferTokensProps {
  web3Context: Web3Context;
  showStatus: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

export function TransferTokens({
  web3Context,
  showStatus,
}: TransferTokensProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { contract, userAccount, contractData, web3, loadContractData } =
    web3Context;

  const handleTransfer = async () => {
    if (!contract || !userAccount || !web3) {
      showStatus("Please connect your wallet first", "error");
      return;
    }

    if (!recipient || !amount) {
      showStatus("Please enter both recipient address and amount", "error");
      return;
    }

    if (!web3.utils.isAddress(recipient)) {
      showStatus("Invalid recipient address format", "error");
      return;
    }

    if (Number.parseFloat(amount) <= 0) {
      showStatus("Amount must be greater than 0", "error");
      return;
    }

    setIsLoading(true);

    try {
      showStatus("Preparing transfer...", "info");

      const decimals = contractData?.decimals || 18;

      // Safe BigInt scaling
      const scaledAmount = BigInt(
        Math.floor(Number(amount) * 10 ** decimals)
      ).toString();

      // Balance check
      const balance = await contract.methods.balanceOf(userAccount).call();
      if (BigInt(balance) < BigInt(scaledAmount)) {
        showStatus("Insufficient balance for transfer", "error");
        return;
      }

      showStatus("Transferring tokens... Please confirm in MetaMask", "info");

      const gasEstimate = await contract.methods
        .transfer(recipient, scaledAmount)
        .estimateGas({
          from: userAccount,
        });

      const result = await contract.methods
        .transfer(recipient, scaledAmount)
        .send({
          from: userAccount,
          gas: Math.floor(Number(gasEstimate) * 1.2), //ensure Number, not BigInt
        });

      console.log("Transfer transaction result:", result);

      showStatus(
        `Successfully transferred ${amount} tokens to ${recipient}!`,
        "success"
      );

      // Refresh UI
      await loadContractData();
      setRecipient("");
      setAmount("");
    } catch (error: unknown) {
      console.error("Transfer error:", error);
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
            "Contract rejected the transaction (check balance and rules)";
        }
      }

      showStatus(`Transfer failed: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-10 shadow-2xl">
      <div className="flex items-center gap-4 mb-3">
        <Send className="w-8 h-8 text-green-400" />
        <div className="text-3xl font-extrabold text-white">
          Transfer Tokens
        </div>
      </div>

      <p className="text-slate-300 text-lg mb-8 leading-relaxed">
        Send your tokens to another wallet address with secure transfer
        validation.
      </p>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8 text-blue-400">
        <strong>Standard Transfer Operation:</strong> Send tokens from your
        wallet to any valid address.
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value.trim())}
            placeholder="Enter destination address (0x...)"
            className="w-full bg-slate-800/80 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-400/10 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">
            Amount to Transfer
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to send"
            step="0.001"
            min="0"
            className="w-full bg-slate-800/80 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-400/10 transition-all duration-200"
          />
        </div>

        {contractData && (
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Available Balance</div>
            <div className="text-green-400 text-xl font-bold">
              {contractData.balance} {contractData.symbol}
            </div>
          </div>
        )}

        <button
          onClick={handleTransfer}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          {isLoading ? "Sending..." : "Send Tokens"}
        </button>
      </div>
    </div>
  );
}
