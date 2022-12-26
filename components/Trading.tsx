import React from "react";
import Chart from "./Chart";

const STYLES = {
	CONTAINER: {
		display: "flex",
		flexDirection: "column" as const,
		justifyContent: "center",
		alignItems: "center",
		margin: "1rem auto",
		width: "80%",
	},
	CHART: {
		width: "100%",
		height: "50vh",
		background: "lightgray",
		borderRadius: "12px",
	},
	BAR: {
		width: "100%",
		height: "30vh",
		background: "gray",
		borderRadius: "12px",
	},
};
export default function Trading() {
	return (
		<div style={STYLES.CONTAINER}>
			<div style={STYLES.CHART}>{/* <Chart /> */}</div>
			<div style={STYLES.BAR}></div>
		</div>
	);
}