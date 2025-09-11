// "use client"

// import { useState, useEffect, useCallback } from "react"
// import Web3 from "web3"
// import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./web3"

// interface ERC20Contract {
//   methods: {
//     name(): { call(): Promise<string> }
//     symbol(): { call(): Promise<string> }
//     decimals(): { call(): Promise<string> }
//     totalSupply(): { call(): Promise<string> }
//     balanceOf(address: string): { call(): Promise<string> }
//     owner(): { call(): Promise<string> }
//     paused(): { call(): Promise<boolean> }
//     mint(
//       to: string,
//       amount: string,
//     ): {
//       send(options: { from: string; gas?: number }): Promise<unknown>
//       estimateGas(options: { from: string }): Promise<number>
//     }
//     transfer(
//       to: string,
//       amount: string,
//     ): {
//       send(options: { from: string; gas?: number }): Promise<unknown>
//       estimateGas(options: { from: string }): Promise<number>
//     }
//     burn(amount: string): {
//       send(options: { from: string; gas?: number }): Promise<unknown>
//       estimateGas(options: { from: string }): Promise<number>
//     }
//     pause(): {
//       send(options: { from: string; gas?: number }): Promise<unknown>
//       estimateGas(options: { from: string }): Promise<number>
//     }
//     unpause(): {
//       send(options: { from: string; gas?: number }): Promise<unknown>
//       estimateGas(options: { from: string }): Promise<number>
//     }
//     transferOwnership(newOwner: string): {
//       send(options: { from: string; gas?: number }): Promise<unknown>
//       estimateGas(options: { from: string }): Promise<number>
//     }
//     renounceOwnership(): {
//       send(options: { from: string; gas?: number }): Promise<unknown>
//       estimateGas(options: { from: string }): Promise<number>
//     }
//   }
// }

// export interface ContractData {
//   name: string
//   symbol: string
//   decimals: number
//   totalSupply: string
//   balance: string
//   owner: string
//   paused: boolean
// }

// export interface Web3Context {
//   web3: Web3 | null
//   contract: ERC20Contract | null
//   userAccount: string | null
//   isOwner: boolean
//   isAdmin: boolean
//   isMinter: boolean
//   contractData: ContractData | null
//   isConnected: boolean
//   connectWallet: () => Promise<void>
//   disconnect: () => void  
//   loadContractData: () => Promise<void>
// }

// export function useWeb3(): Web3Context {
//   const [web3, setWeb3] = useState<Web3 | null>(null)
//   const [contract, setContract] = useState<ERC20Contract | null>(null)
//   const [userAccount, setUserAccount] = useState<string | null>(null)
//   const [isOwner, setIsOwner] = useState(false)
//   const [isAdmin, setIsAdmin] = useState(false)
//   const [isMinter, setIsMinter] = useState(false)
//   const [contractData, setContractData] = useState<ContractData | null>(null)
//   const [isConnected, setIsConnected] = useState(false)

//   const connectWallet = useCallback(async () => {
//     if (typeof window === "undefined" || !window.ethereum) {
//       throw new Error("MetaMask not detected! Please install MetaMask extension.")
//     }

//     try {
//       const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[]
//       const web3Instance = new Web3(window.ethereum)

//       if (accounts.length === 0) {
//         throw new Error("No accounts found. Please unlock MetaMask.")
//       }

//       const account = accounts[0]
//       const code = await web3Instance.eth.getCode(CONTRACT_ADDRESS)
//       if (code === "0x" || code === "0x0") {
//         throw new Error(`Contract not found at ${CONTRACT_ADDRESS}. Please check the address or switch networks.`)
//       }

//       const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS) as ERC20Contract
//       await contractInstance.methods.name().call()

//       setWeb3(web3Instance)
//       setContract(contractInstance)
//       setUserAccount(account)
//       setIsConnected(true)
//     } catch (error) {
//       console.error("Connection error:", error)
//       throw error
//     }
//   }, [])

//   const loadContractData = useCallback(async () => {
//     if (!contract || !userAccount) return

//     try {
//       const [name, symbol, decimals, totalSupply, balance, owner, paused] = await Promise.all([
//         contract.methods.name().call(),
//         contract.methods.symbol().call(),
//         contract.methods.decimals().call(),
//         contract.methods.totalSupply().call(),
//         contract.methods.balanceOf(userAccount).call(),
//         contract.methods.owner().call(),
//         contract.methods.paused().call(),
//       ])

//       const decimalPlaces = Number.parseInt(decimals as string)
//       const divisor = Math.pow(10, decimalPlaces)

//       const formattedBalance = (Number.parseFloat(balance as string) / divisor).toFixed(3)
//       const formattedTotalSupply = (Number.parseFloat(totalSupply as string) / divisor).toFixed(3)

//       const ownerCheck = (owner as string).toLowerCase() === userAccount.toLowerCase()
//       setIsOwner(ownerCheck)
//       setIsAdmin(ownerCheck)
//       setIsMinter(ownerCheck)

//       setContractData({
//         name: name as string,
//         symbol: symbol as string,
//         decimals: decimalPlaces,
//         totalSupply: formattedTotalSupply,
//         balance: formattedBalance,
//         owner: owner as string,
//         paused: paused as boolean,
//       })
//     } catch (error) {
//       console.error("Error loading contract data:", error)
//       throw error
//     }
//   }, [contract, userAccount])

//   useEffect(() => {
//     if (typeof window !== "undefined" && window.ethereum) {
//       window.ethereum
//         .request({ method: "eth_accounts" })
//         .then((accounts) => {
//           const accountsArray = accounts as string[]
//           if (accountsArray.length > 0) {
//             connectWallet().catch(console.error)
//           }
//         })
//         .catch(console.error)
//     }
//   }, [connectWallet])

//   useEffect(() => {
//     if (isConnected && contract && userAccount) {
//       loadContractData().catch(console.error)
//     }
//   }, [isConnected, contract, userAccount, loadContractData])

//   useEffect(() => {
//     if (typeof window !== "undefined" && window.ethereum) {
//       const handleAccountsChanged = () => {
//         window.location.reload()
//       }

//       const handleChainChanged = () => {
//         window.location.reload()
//       }

//       window.ethereum.on("accountsChanged", handleAccountsChanged)
//       window.ethereum.on("chainChanged", handleChainChanged)

//       return () => {
//         if (window.ethereum) {
//           window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
//           window.ethereum.removeListener("chainChanged", handleChainChanged)
//         }
//       }
//     }
//   }, [userAccount])

//   const disconnect = () => {
//     setWeb3(null)
//     setContract(null)
//     setUserAccount(null)
//     setIsConnected(false)
//     setContractData(null)
//     setIsOwner(false)
//     setIsAdmin(false)
//     setIsMinter(false)

//     // Clear cached provider (avoids auto-reconnect)
//     if (typeof window !== "undefined") {
//       localStorage.removeItem("walletConnected")
//     }
//   }

//   return {
//     web3,
//     contract,
//     userAccount,
//     isOwner,
//     isAdmin,
//     isMinter,
//     contractData,
//     isConnected,
//     connectWallet,
//     disconnect,
//     loadContractData,
//   }
// }







"use client"

import { useState, useEffect, useCallback } from "react"
import Web3 from "web3"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./web3"

interface ERC20Contract {
  methods: {
    name(): { call(): Promise<string> }
    symbol(): { call(): Promise<string> }
    decimals(): { call(): Promise<string> }
    totalSupply(): { call(): Promise<string> }
    balanceOf(address: string): { call(): Promise<string> }
    owner(): { call(): Promise<string> }
    paused(): { call(): Promise<boolean> }
    mint(
      to: string,
      amount: string,
    ): {
      send(options: { from: string; gas?: number }): Promise<unknown>
      estimateGas(options: { from: string }): Promise<number>
    }
    transfer(
      to: string,
      amount: string,
    ): {
      send(options: { from: string; gas?: number }): Promise<unknown>
      estimateGas(options: { from: string }): Promise<number>
    }
    burn(amount: string): {
      send(options: { from: string; gas?: number }): Promise<unknown>
      estimateGas(options: { from: string }): Promise<number>
    }
    pause(): {
      send(options: { from: string; gas?: number }): Promise<unknown>
      estimateGas(options: { from: string }): Promise<number>
    }
    unpause(): {
      send(options: { from: string; gas?: number }): Promise<unknown>
      estimateGas(options: { from: string }): Promise<number>
    }
    transferOwnership(newOwner: string): {
      send(options: { from: string; gas?: number }): Promise<unknown>
      estimateGas(options: { from: string }): Promise<number>
    }
    renounceOwnership(): {
      send(options: { from: string; gas?: number }): Promise<unknown>
      estimateGas(options: { from: string }): Promise<number>
    }
  }
}

export interface ContractData {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  balance: string
  owner: string
  paused: boolean
}

export interface Web3Context {
  web3: Web3 | null
  contract: ERC20Contract | null
  userAccount: string | null
  isOwner: boolean
  isAdmin: boolean
  isMinter: boolean
  contractData: ContractData | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnect: () => void
  loadContractData: () => Promise<void>
}

export function useWeb3(): Web3Context {
  const [web3, setWeb3] = useState<Web3 | null>(null)
  const [contract, setContract] = useState<ERC20Contract | null>(null)
  const [userAccount, setUserAccount] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMinter, setIsMinter] = useState(false)
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined") {
      throw new Error("Window is not defined")
    }

    if (!window.ethereum) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile) {
        // Redirect to MetaMask app
        window.open(`https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`, "_blank")
        return
      }
      throw new Error("MetaMask not detected! Please install MetaMask extension.")
    }

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.")
      }

      const web3Instance = new Web3(window.ethereum)
      const code = await web3Instance.eth.getCode(CONTRACT_ADDRESS)

      if (code === "0x" || code === "0x0") {
        throw new Error(`Contract not found at ${CONTRACT_ADDRESS}. Please check address or switch network.`)
      }

      const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS) as ERC20Contract

      setWeb3(web3Instance)
      setContract(contractInstance)
      setUserAccount(accounts[0])
      setIsConnected(true)
    } catch (err) {
      console.error("Connection error:", err)
      throw err
    }
  }, [])

  const loadContractData = useCallback(async () => {
    if (!contract || !userAccount) return

    try {
      const [name, symbol, decimals, totalSupply, balance, owner, paused] = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.decimals().call(),
        contract.methods.totalSupply().call(),
        contract.methods.balanceOf(userAccount).call(),
        contract.methods.owner().call(),
        contract.methods.paused().call(),
      ])

      const decimalPlaces = Number.parseInt(decimals as string)
      const divisor = Math.pow(10, decimalPlaces)

      const formattedBalance = (Number(balance) / divisor).toFixed(3)
      const formattedTotalSupply = (Number(totalSupply) / divisor).toFixed(3)

      const ownerCheck = (owner as string).toLowerCase() === userAccount.toLowerCase()
      setIsOwner(ownerCheck)
      setIsAdmin(ownerCheck)
      setIsMinter(ownerCheck)

      setContractData({
        name: name as string,
        symbol: symbol as string,
        decimals: decimalPlaces,
        totalSupply: formattedTotalSupply,
        balance: formattedBalance,
        owner: owner as string,
        paused: paused as boolean,
      })
    } catch (error) {
      console.error("Error loading contract data:", error)
      throw error
    }
  }, [contract, userAccount])

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if ((accounts as string[]).length > 0) {
            connectWallet().catch(console.error)
          }
        })
        .catch(console.error)
    }
  }, [connectWallet])

  useEffect(() => {
    if (isConnected && contract && userAccount) {
      loadContractData().catch(console.error)
    }
  }, [isConnected, contract, userAccount, loadContractData])

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = () => window.location.reload()
      const handleChainChanged = () => window.location.reload()

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum?.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const disconnect = () => {
    setWeb3(null)
    setContract(null)
    setUserAccount(null)
    setIsConnected(false)
    setContractData(null)
    setIsOwner(false)
    setIsAdmin(false)
    setIsMinter(false)

    if (typeof window !== "undefined") {
      localStorage.removeItem("walletConnected")
    }
  }

  return {
    web3,
    contract,
    userAccount,
    isOwner,
    isAdmin,
    isMinter,
    contractData,
    isConnected,
    connectWallet,
    disconnect,
    loadContractData,
  }
}




