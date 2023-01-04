import Head from "next/head";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import Trading from "../components/Trading";
import Ticket from "../components/Ticket";
import History from "../components/History";

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
		fontSize: "2.5rem",
		fontWeight: "bold" as const,
		width: "80%",
		margin: "1rem 0",
	},
};

export default function Home() {
	return (
		<>
			<Head>
				<meta name="description" content="zkOBS" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Header />
			<div style={STYLES.SECTION}>
				<h1 style={STYLES.H1}>ETH / USDC</h1>
				<Trading />
				<Ticket />
				<History />
			</div>
		</>
	);
}
