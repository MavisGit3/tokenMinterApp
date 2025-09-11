"use client";

import { useState } from "react";
import { Menu, ChevronDown, Coins, User, } from "lucide-react";
import type { Web3Context } from "@/src/hooks/use-web3";

interface NavbarProps {
  web3Context: Web3Context;
  onMenuToggle: () => void;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void; 
  showStatus: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

export function Navbar({
  web3Context,
  onMenuToggle,
  onConnectWallet,
  onDisconnectWallet, 
}: NavbarProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { isConnected, userAccount, contractData, isOwner, isMinter, isAdmin } =
    web3Context;

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const getUserRole = () => {
    if (isOwner)
      return { text: "OWNER", className: "bg-blue-500/20 text-blue-400" };
    if (isAdmin)
      return { text: "ADMIN", className: "bg-blue-500/20 text-blue-400" };
    if (isMinter)
      return { text: "MINTER", className: "bg-green-500/20 text-green-400" };
    return { text: "STANDARD USER", className: "bg-gray-500/20 text-gray-400" };
  };

  const getStatusIndicator = () => {
    if (!contractData)
      return { text: "Loading...", className: "bg-gray-500/20 text-gray-400" };
    return contractData.paused
      ? { text: "PAUSED", className: "bg-red-500/20 text-red-400" }
      : { text: "ACTIVE", className: "bg-green-500/20 text-green-400" };
  };

  return (
    <nav className="bg-slate-900/85 backdrop-blur-xl border-b border-slate-700 p-4 sticky top-0 z-50 shadow-xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuToggle}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 hover:bg-blue-500/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Menu className="w-5 h-5 text-blue-400" />
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TokenLab</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && contractData && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg">
              <Coins className="w-4 h-4" />
              <span>{contractData.balance}</span>
            </div>
          )}

          {isConnected && userAccount ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 hover:border-blue-400 hover:bg-blue-500/10 transition-all duration-200 flex items-center gap-2 text-white"
              >
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-6 h-6 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span>Profile</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50">
                  <div className="p-5 border-b border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 w-10 h-10 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">
                          Wallet Connected
                        </h4>
                        <p className="text-slate-400 text-sm">
                          {formatAddress(userAccount)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">
                        <div className="text-blue-400 text-lg font-bold">
                          {contractData?.balance || "0.000"}
                        </div>
                        <div className="text-slate-400 text-xs uppercase tracking-wide">
                          Your Balance
                        </div>
                      </div>
                      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">
                        <div className="text-blue-400 text-lg font-bold">
                          {contractData?.totalSupply || "0.000"}
                        </div>
                        <div className="text-slate-400 text-xs uppercase tracking-wide">
                          Total Supply
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h5 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      Contract Information
                    </h5>

                    <div className="space-y-3">
                      {/* Contract Info Rows */}
                      <div className="flex justify-between items-center py-2 px-3 bg-slate-800/40 rounded-md">
                        <span className="text-slate-400 text-sm">Token Name</span>
                        <span className="text-white text-sm font-mono">
                          {contractData?.name || "Loading..."}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-slate-800/40 rounded-md">
                        <span className="text-slate-400 text-sm">Symbol</span>
                        <span className="text-white text-sm font-mono">
                          {contractData?.symbol || "Loading..."}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-slate-800/40 rounded-md">
                        <span className="text-slate-400 text-sm">Decimals</span>
                        <span className="text-white text-sm font-mono">
                          {contractData?.decimals || 18}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-slate-800/40 rounded-md">
                        <span className="text-slate-400 text-sm">
                          Contract Owner
                        </span>
                        <span className="text-white text-sm font-mono">
                          {contractData?.owner
                            ? formatAddress(contractData.owner)
                            : "Loading..."}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-slate-800/40 rounded-md">
                        <span className="text-slate-400 text-sm">Your Role</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${getUserRole().className}`}
                        >
                          <span className="w-1.5 h-1.5 bg-current rounded-full inline-block mr-2"></span>
                          {getUserRole().text}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-slate-800/40 rounded-md">
                        <span className="text-slate-400 text-sm">Status</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${getStatusIndicator().className}`}
                        >
                          <span className="w-1.5 h-1.5 bg-current rounded-full inline-block mr-2"></span>
                          {getStatusIndicator().text}
                        </span>
                      </div>
                    </div>

                    {/* Disconnect Button */}
                    <div className="mt-6">
                      <button
                        onClick={onDisconnectWallet}
                        
                        className="w-full py-2 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 rounded-md"
                      >
                        {/* <LogOut className="h-4 w-4 mr-2" /> */}
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
