"use client";

import { Coins, Send, Flame, AlertTriangle } from "lucide-react";
import type { Web3Context } from "@/src/hooks/use-web3";
import { CONTRACT_ADDRESS } from "@/src/hooks/web3";

interface DashboardProps {
  web3Context: Web3Context;
  showStatus: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

export function Dashboard({ web3Context }: DashboardProps) {
  const { contractData } = web3Context;

  const features = [
    {
      icon: Coins,
      title: "Token Minting",
      description:
        "Create new tokens with owner-controlled supply management and secure distribution mechanisms.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Send,
      title: "Secure Transfers",
      description:
        "Execute token transfers with pause-protected operations and real-time balance updates.",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Flame,
      title: "Token Burning",
      description:
        "Reduce token supply through controlled burning mechanisms with permanent supply reduction.",
      gradient: "from-red-500 to-red-600",
    },
    {
      icon: AlertTriangle,
      title: "Emergency Controls",
      description:
        "Comprehensive security features including pause functionality for incident response and maintenance.",
      gradient: "from-yellow-500 to-yellow-600",
    },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-10 shadow-2xl">
      <div className="flex items-center gap-4 mb-3">
        <div className="text-3xl font-extrabold text-white">
          Welcome To The ERC-20 Token Lab
        </div>
      </div>

      <p className="text-slate-300 text-lg mb-8 leading-relaxed">
        Professional smart contract interface for token operations including
        minting, transfers, burning, and emergency controls. Built with
        industry-standard security practices.
      </p>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 text-blue-400">
        <strong>Network Information:</strong> Make sure you are connected to the
        correct network in MetaMask. Current contract is deployed on your
        selected network.
      </div>

      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 mb-8 font-mono text-sm text-slate-300">
        <strong>Contract Address:</strong>
        <br />
        <span className="text-blue-400 break-all">{CONTRACT_ADDRESS}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {contractData && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {contractData.balance}
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wide">
              Your Balance
            </div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {contractData.totalSupply}
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wide">
              Total Supply
            </div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 text-center">
            <div
              className={`text-2xl font-bold mb-1 ${
                contractData.paused ? "text-red-400" : "text-green-400"
              }`}
            >
              {contractData.paused ? "PAUSED" : "ACTIVE"}
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wide">
              Contract Status
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
