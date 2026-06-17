"use client"

import { useEffect, useState } from "react"
import { createMultichainClient } from "@metamask/connect-multichain"
import { Wallet } from "lucide-react"

type MultichainClient = Awaited<ReturnType<typeof createMultichainClient>>

type SessionAccount = {
  address: string
}

type SessionScope = {
  accounts?: SessionAccount[]
}

type SessionData = {
  sessionScopes?: Record<string, SessionScope>
}

const MetaMaskConnect = () => {
  const [client, setClient] = useState<MultichainClient | null>(null)
  const [ethAccount, setEthAccount] = useState<string | null>(null)
  const [solAccount, setSolAccount] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const c = await createMultichainClient({
          dapp: {
            name: "Best Multichain Dapp Ever",
            url: window.location.href,
          },
          api: {
            supportedNetworks: {
              "eip155:1": "https://mainnet.infura.io/v3/90ccd6a5902b4f0987aaddf7d7c0833e",
              "eip155:137": "https://polygon-mainnet.infura.io/v3/90ccd6a5902b4f0987aaddf7d7c0833e",
              "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp":
                "https://solana-mainnet.infura.io/v3/90ccd6a5902b4f0987aaddf7d7c0833e",
            },
          },
        })
        setClient(c)
        if (client) {
          setEthAccount(localStorage.getItem("ethAccount") || null)
          setSolAccount(localStorage.getItem("solAccount") || null)
        }
      } catch (err) {
        console.error(err)
      }
    }
    init()
  }, [])

  const handleMetaMaskConnect = async () => {
    if (!client) return
    try {
      setLoading(true)
      await client.connect(
        [
          "eip155:1",
          "eip155:137",
          "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
        ],
        []
      )
      const session = (await client.provider.getSession()) as SessionData
      const eth = session.sessionScopes?.["eip155:1"]?.accounts ?? []
      const sol =
        session.sessionScopes?.["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"]
          ?.accounts ?? []
      setEthAccount(eth[0]?.address ?? eth[0] ?? null)
      setSolAccount(sol[0]?.address ?? sol[0] ?? null)
      localStorage.setItem("ethAccount", eth[0]?.address ?? eth[0] ?? "")
      localStorage.setItem("solAccount", sol[0]?.address ?? sol[0] ?? "")
      alert(`Sign in to JP Soccer with ${eth[0]?.address ?? eth[0] ?? sol[0]?.address ?? sol[0] ?? "unknown account"}`)
      //console.log(eth) => Array [ "eip155:1:0xf01f9ab8de65d3916a707eebfe4e0d71cf4e3d4f" ]

      //console.log(sol) => Array [ "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:GLh4iLkDaGvDW2eyjHWKTerxJbq7f5myvsC88tUmJVMk" ]
    } catch (error) {
      console.error(error)
      alert("Failed to connect to MetaMask. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleMetaMaskDisconnect = async () => {
    if (!client) return
    try {
      setLoading(true)
      await client.disconnect()
      setEthAccount(null)
      setSolAccount(null)
      localStorage.setItem("ethAccount", "")
      localStorage.setItem("solAccount", "")
      alert("Disconnected from MetaMask.")
    } catch (error) {
      console.error(error)
      alert("Failed to disconnect from MetaMask. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /* for future WalletConnect support
  const handleWalletConnect = () => {
    window.open("https://walletconnect.com/", "_blank", "noopener,noreferrer")
  }*/

  if(ethAccount && solAccount) {
    return (
      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={handleMetaMaskDisconnect}
          disabled={loading || !client}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-600 bg-gray-900 px-6 py-4 font-semibold text-white transition-colors hover:border-yellow-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wallet className="h-5 w-5 text-[#f6851b]" />
          {loading ? "Disconnecting MetaMask..." : "Disconnect MetaMask"}
        </button>

        <p className="text-sm text-gray-300">ETH: {ethAccount}</p>
        <p className="text-sm text-gray-300">SOL: {solAccount}</p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <button
        type="button"
        onClick={handleMetaMaskConnect}
        disabled={loading || !client}
        className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-600 bg-gray-900 px-6 py-4 font-semibold text-white transition-colors hover:border-yellow-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Wallet className="h-5 w-5 text-[#f6851b]" />
        {loading ? "Connecting MetaMask..." : "Connect MetaMask"}
      </button>

      {ethAccount && <p className="text-sm text-gray-300">ETH: {ethAccount}</p>}
      {solAccount && <p className="text-sm text-gray-300">SOL: {solAccount}</p>}
    </div>
  )
}

/* for future WalletConnect support
      <button
        type="button"
        onClick={handleWalletConnect}
        className="w-full flex items-center justify-center gap-3 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-4 font-semibold text-cyan-100 transition-colors hover:border-cyan-400 hover:bg-cyan-500/20"
      >
        <Wallet className="h-5 w-5 text-cyan-300" />
        Open WalletConnect
      </button>
*/

export default MetaMaskConnect