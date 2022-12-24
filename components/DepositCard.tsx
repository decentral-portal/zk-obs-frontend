import { Button, Input } from "@chakra-ui/react";
import React from "react";

const STYLES = {
	CONTAINER: {
		display: "flex",
		flexDirection: "row" as const,
		alignItems: "center",
		justifyContent: "space-between",
		width: "50%",
		margin: "1rem auto",
	},
};

export default function DepositCard() {
	return (
		<div style={STYLES.CONTAINER}>
			<Input width="300px" />
			<Button width="150px">Deposit</Button>
		</div>
	);
}
