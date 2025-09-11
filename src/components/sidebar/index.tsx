"use client"

import type React from "react"

import { Home, Coins, Send, Flame, AlertTriangle, Users, Crown } from "lucide-react"

type Section = "dashboard" | "mint" | "transfer" | "burn" | "emergency" | "minterManagement" | "adminManagement"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeSection: Section
  onSectionChange: (section: Section) => void
}

interface NavItem {
  id: Section
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeType?: "default" | "danger"
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "mint", label: "Mint Tokens", icon: Coins, badge: "MINTER" },
  { id: "transfer", label: "Transfer Tokens", icon: Send },
  { id: "burn", label: "Burn Tokens", icon: Flame },
  { id: "emergency", label: "Emergency Controls", icon: AlertTriangle, badge: "OWNER", badgeType: "danger" },
  { id: "minterManagement", label: "Minter Management", icon: Users, badge: "OWNER" },
  { id: "adminManagement", label: "Admin Management", icon: Crown, badge: "OWNER" },
]

export function Sidebar({ isOpen, activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 w-96 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 transition-transform duration-300 ease-out z-50 shadow-2xl ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-8 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2">ERC-20 Token Lab</h2>
        <p className="text-slate-400 text-sm">Token Lab Menu</p>
      </div>

      <nav className="p-6">
        <div className="mb-6">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 px-3">Overview</div>
          <NavItemComponent
            item={navItems[0]}
            isActive={activeSection === navItems[0].id}
            onClick={() => onSectionChange(navItems[0].id)}
          />
        </div>

        <div className="mb-6">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 px-3">Token Operations</div>
          <div className="space-y-1">
            {navItems.slice(1, 4).map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                onClick={() => onSectionChange(item.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 px-3">Security & Control</div>
          <div className="space-y-1">
            {navItems.slice(4).map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                onClick={() => onSectionChange(item.id)}
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}

interface NavItemComponentProps {
  item: NavItem
  isActive: boolean
  onClick: () => void
}

function NavItemComponent({ item, isActive, onClick }: NavItemComponentProps) {
  const Icon = item.icon

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-6 py-3 text-left transition-all duration-200 rounded-lg border-l-3 ${
        isActive
          ? "bg-blue-500/12 text-blue-400 border-l-blue-400 font-semibold"
          : "text-slate-400 hover:bg-blue-500/8 hover:text-blue-400 border-l-transparent hover:border-l-blue-400/30"
      }`}
    >
      <Icon className="w-5 h-5 mr-4" />
      <span className="flex-1 text-sm">{item.label}</span>
      {item.badge && (
        <span
          className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${
            item.badgeType === "danger" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {item.badge}
        </span>
      )}
    </button>
  )
}
