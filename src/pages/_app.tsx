import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, goerli, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { APP_ALCHEMY_ID, VALID_CHAIN } from "../config";
import {
	TsAccountContext,
	TsAccountProvider,
} from "../components/TsAccountProvider";
import { useContext, useEffect } from "react";
import { InjectedConnector } from "wagmi/connectors/injected";

const { chains, provider } = configureChains(
	[VALID_CHAIN],
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
					<TsAccountProvider>
						<Component {...pageProps} />
					</TsAccountProvider>
				</RainbowKitProvider>
			</WagmiConfig>
		</ChakraProvider>
	);
}
