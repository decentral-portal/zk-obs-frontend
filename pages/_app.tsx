import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, goerli, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { APP_ALCHEMY_ID } from "./config";

const { chains, provider } = configureChains(
	[mainnet, polygon, optimism, arbitrum, goerli],
	[alchemyProvider({ apiKey: APP_ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
	appName: "My RainbowKit App",
	chains,
});

const wagmiClient = createClient({
	autoConnect: false,
	connectors,
	provider,
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider>
			<WagmiConfig client={wagmiClient}>
				<RainbowKitProvider chains={chains}>
					<Component {...pageProps} />
				</RainbowKitProvider>
			</WagmiConfig>
		</ChakraProvider>
	);
}
