import React from "react";

const STYLES = {
	CONTAINER: {
		display: "flex",
		flexDirection: "column" as const,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "black",
		margin: "1rem auto",
		width: "80%",
	},
	CHART: {
		width: "100%",
		height: "50vh",
		background: "lightgray",
	},
	BAR: {
		width: "100%",
		height: "30vh",
		background: "gray",
	},
};

export default function TradingChart() {
	return (
		<div style={STYLES.CONTAINER}>
			<div style={STYLES.CHART}></div>
			<div style={STYLES.BAR}></div>
		</div>
	);
}
