import { Button } from "@chakra-ui/react";
import React from "react";

const STYLES = {
	CONTAINER: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		margin: "1rem auto",
	},
};

export default function Faucet() {
	return (
		<div style={STYLES.CONTAINER}>
			<Button>Mint 1000 testUSD</Button>
		</div>
	);
}
