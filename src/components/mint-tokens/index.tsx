"use client";

import { useState } from "react";
import { Coins, Plus } from "lucide-react";
import type { Web3Context } from "@/src/hooks/use-web3";

interface MintTokensProps {
  web3Context: Web3Context;
  showStatus: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

export function MintTokens({ web3Context, showStatus }: MintTokensProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    contract,
    userAccount,
    isMinter,
    isOwner,
    isAdmin,
    web3,
    loadContractData,
  } = web3Context;

  const handlePresetSelect = async (preset: string) => {
    if (preset === "self" && userAccount) {
      setRecipient(userAccount);
    } else if (preset === "owner" && contract) {
      try {
        const owner = await contract.methods.owner().call();
        setRecipient(owner);
      } catch (error) {
        console.error("Error getting owner:", error);
        showStatus("Error getting contract owner address", "error");
      }
    }
  };

  const handleMint = async () => {
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

    if (!isMinter && !isOwner && !isAdmin) {
      showStatus("Only minters or admins can mint tokens", "error");
      return;
    }

    // Reject >18 decimal places
    if (amount.includes(".") && amount.split(".")[1].length > 18) {
      showStatus("Too many decimal places (max 18 allowed)", "error");
      return;
    }

    setIsLoading(true);

    try {
      showStatus("Preparing to mint tokens...", "info");

      // Safe conversion for ERC20 with 18 decimals
      const scaledAmount = web3.utils.toWei(amount.toString(), "ether");

      showStatus("Minting tokens... Please confirm in MetaMask", "info");

      const gasEstimate = await contract.methods
        .mint(recipient, scaledAmount)
        .estimateGas({
          from: userAccount,
        });

      const result = await contract.methods.mint(recipient, scaledAmount).send({
        from: userAccount,
        gas: Math.floor(Number(gasEstimate) * 1.2), //  convert BigInt -> Number
      });

      console.log("Mint transaction result:", result);

      showStatus(
        `Successfully minted ${amount} tokens to ${recipient}!`,
        "success"
      );

      // Reload contract data and reset form
      await loadContractData();
      setRecipient("");
      setAmount("");
    } catch (error: unknown) {
      console.error("Minting error:", error);
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
            "Contract rejected the transaction (check permissions)";
        }
      }
      showStatus(`Minting failed: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-10 shadow-2xl">
      <div className="flex items-center gap-4 mb-3">
        <Coins className="w-8 h-8 text-blue-400" />
        <div className="text-3xl font-extrabold text-white">Mint Tokens</div>
      </div>

      <p className="text-slate-300 text-lg mb-8 leading-relaxed">
        Create new tokens and distribute them to specified addresses with minter
        access control.
      </p>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8 text-blue-400">
        <strong>Minter Restricted Function:</strong> Only addresses with the
        minter role can mint new tokens.
      </div>

      <div className="space-y-6">
        {/* Recipient Input */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value.trim())}
            placeholder="Enter wallet address (0x...)"
            className="w-full bg-slate-800/80 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all duration-200"
          />
        </div>

        {/* Quick Select */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Quick Select Recipient
          </label>
          <select
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="w-full bg-slate-800/80 border-2 border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all duration-200"
          >
            <option value="">Choose from presets...</option>
            <option value="self">My Wallet Address</option>
            <option value="owner">Contract Owner Address</option>
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Amount to Mint
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter token amount (e.g., 100.5)"
            step="0.000000000000000001" // supports up to 18 decimals
            min="0"
            className="w-full bg-slate-800/80 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all duration-200"
          />
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={isLoading || (!isMinter && !isOwner && !isAdmin)}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {isLoading ? "Minting..." : "Mint Tokens"}
        </button>
      </div>
    </div>
  );
}
