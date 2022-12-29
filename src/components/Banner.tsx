import React, { useEffect } from "react";

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
		fontSize: "3rem",
		fontWeight: "bold" as const,
		margin: "1rem auto",
	},
};

export default function Banner() {
	return (
		<div style={STYLES.CONTAINER}>
			<h1 style={STYLES.H1}>
				Zero-knowledge
				<br />
				Order Book System
			</h1>
		</div>
	);
}
