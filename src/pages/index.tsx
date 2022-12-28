import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import Trading from "../components/Trading";
import Ticket from "../components/Ticket";
import History from "../components/History";
import { Toast } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import { useNetwork, useAccount, useSwitchNetwork, useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { TsAccountContext } from "../components/TsAccountProvider";
import { VALID_CHAIN } from "./config";

const inter = Inter({ subsets: ["latin"] });

const STYLES = {
	SECTION: {
		display: "flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	H1: {
		fontSize: "1.5rem",
		fontWeight: "bold" as const,
		width: "80%",
		margin: "1rem 0",
	},
};

export default function Home() {
	return (
		<>
			<Head>
				<title>Create Next App</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="true"
				/>
				<link
					href={`https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap`}
					rel="stylesheet"
				/>
			</Head>
			<Header />
			<div style={STYLES.SECTION}>
				<h1 style={STYLES.H1}>goerliETH/testUSD</h1>
				<Trading />
				<Ticket />
				<History />
			</div>
		</>
	);
}