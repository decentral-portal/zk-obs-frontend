import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const STYLES = {
	HEADER: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "gray",
		padding: "0 50px",
		height: "80px",
		width: "100%",
	},
	TITLE: {
		fontSize: "36px",
		fontWeight: "bold",
		color: "white",
	},
};

export default function Header() {
	return (
		<div style={STYLES.HEADER}>
			<div style={STYLES.TITLE}>ZK-OBS</div>
			<ConnectButton />
		</div>
	);
}
