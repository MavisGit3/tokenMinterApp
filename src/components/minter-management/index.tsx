"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Crown, User } from "lucide-react";
import type { Web3Context } from "@/src/hooks/use-web3";

interface MinterManagementProps {
  web3Context: Web3Context;
  showStatus: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

interface OwnerInfo {
  address: string;
  isCurrentUser: boolean;
}

export function MinterManagement({
  web3Context,
  showStatus,
}: MinterManagementProps) {
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const { contract, userAccount, isOwner } = web3Context;

  const loadOwner = useCallback(async () => {
    if (!contract) return;

    setLoadingOwner(true);
    try {
      const ownerAddr = (await contract.methods.owner().call()) as string;

      setOwner({
        address: ownerAddr,
        isCurrentUser: ownerAddr.toLowerCase() === userAccount?.toLowerCase(),
      });
    } catch (error) {
      console.error("Error loading owner:", error);
      showStatus("Error loading owner information", "error");
    } finally {
      setLoadingOwner(false);
    }
  }, [contract, userAccount, showStatus]);

  useEffect(() => {
    if (contract) {
      loadOwner();
    }
  }, [contract, loadOwner]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-10 shadow-2xl">
      <div className="flex items-center gap-4 mb-3">
        <Users className="w-8 h-8 text-blue-400" />
        <div className="text-3xl font-extrabold text-white">
          Owner Management
        </div>
      </div>

      <p className="text-slate-300 text-lg mb-8 leading-relaxed">
        View the current contract owner. Only the owner can mint tokens and
        manage the contract.
      </p>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8 text-blue-400">
        <strong>Owner-Only Contract:</strong> This contract uses owner-based
        permissions. Only the contract owner can mint tokens, pause/unpause the
        contract, and transfer ownership. There are no separate minter roles.
      </div>

      <div className="border border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-slate-800/60 px-4 py-3 border-b border-slate-700">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Contract Owner{" "}
            {loadingOwner && (
              <span className="text-sm text-slate-400">(Loading...)</span>
            )}
          </h4>
        </div>

        <div className="bg-slate-800/40">
          {!owner && !loadingOwner ? (
            <div className="p-4 text-center text-slate-400">
              Unable to load owner information
            </div>
          ) : owner ? (
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="font-mono text-sm text-slate-300 break-all">
                  {owner.address}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-bold uppercase">
                  <Crown className="w-3 h-3 inline mr-1" />
                  OWNER
                </span>
                {owner.isCurrentUser && (
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold uppercase">
                    <User className="w-3 h-3 inline mr-1" />
                    YOU
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-400">
              Loading owner information...
            </div>
          )}
        </div>
      </div>

      {!isOwner && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6 text-yellow-400 text-center">
          <strong>Owner Only:</strong> Only the contract owner can mint tokens
          and manage the contract. To transfer ownership, use the Admin
          Management section.
        </div>
      )}
    </div>
  );
}
