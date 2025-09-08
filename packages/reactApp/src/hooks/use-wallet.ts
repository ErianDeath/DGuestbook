"use client"

import { useState, useEffect } from "react"

interface WalletState {
  isConnected: boolean
  address: string
  isConnecting: boolean
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: "",
    isConnecting: false,
  })

  // Load wallet state from localStorage on mount
  useEffect(() => {
    const savedWalletState = localStorage.getItem("walletState")
    if (savedWalletState) {
      try {
        const parsed = JSON.parse(savedWalletState)
        setWalletState(parsed)
      } catch (error) {
        console.error("Failed to parse saved wallet state:", error)
      }
    }
  }, [])

  // Save wallet state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("walletState", JSON.stringify(walletState))
  }, [walletState])

  const connectWallet = async () => {
    setWalletState((prev) => ({ ...prev, isConnecting: true }))

    try {
      // Simulate wallet connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock wallet connection - in real app, this would use Web3 provider
      const mockAddress = "0x1234567890abcdef1234567890abcdef12345678"

      setWalletState({
        isConnected: true,
        address: mockAddress,
        isConnecting: false,
      })
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setWalletState((prev) => ({ ...prev, isConnecting: false }))
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: "",
      isConnecting: false,
    })
  }

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
  }
}
