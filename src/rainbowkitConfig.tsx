"use client"

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { anvil, sepolia } from "wagmi/chains";

export default getDefaultConfig({
    appName: "Betting Game",
    chains: [anvil, sepolia],
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, // Replace with your actual project ID
    ssr: false
});