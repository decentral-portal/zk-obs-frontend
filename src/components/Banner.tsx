import React from "react";
import { Image } from "@chakra-ui/react";
import iconImg from "../assets/icon.png";

const STYLES = {
	CONTAINER: {
		display: "flex",
		flexDirection: "row" as const,
		alignItems: "center",
		justifyContent: "flex-start",
		margin: "1rem auto",
		width: "60%",
	},
	H1: {
		fontSize: "2rem",
		fontWeight: "bold" as const,
		margin: "0 auto",
	},
};

export default function Banner() {
	return (
		<div style={STYLES.CONTAINER}>
			<Image src={iconImg.src} boxSize="200px" alt="icon" p={4} />
			<h1 style={STYLES.H1}>
				Zero-knowledge
				<br />
				Order Book System
			</h1>
		</div>
	);
}
