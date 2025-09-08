"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from 'wagmi/connectors'

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return {
    isConnected,
    address: address || "",
    isConnecting,
    connectWallet: () => connect({ connector: injected() }),
    disconnectWallet: () => disconnect(),
  }
}