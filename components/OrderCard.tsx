import { InputGroup, Input, Button, InputRightAddon } from "@chakra-ui/react";
import React from "react";

const STYLES = {
	CONTAINER: {
		display: "flex",
		flexDirection: "column" as const,
		backgroundColor: "lightgray",
		width: "40%",
	},
};

interface OrderCardProps {
	marketType: "limited" | "market";
	orderType: "buy" | "sell";
	tokens: {
		tokenA: string;
		tokenB: string;
	};
}

export default function OrderCard(props: OrderCardProps) {
	const { marketType, orderType, tokens } = props;
	return (
		<div style={STYLES.CONTAINER}>
			<InputGroup>
				{marketType === "limited" ? (
					<Input type="price" placeholder="price" />
				) : (
					<Input type="price" placeholder="market price" isDisabled />
				)}
				<InputRightAddon>{tokens.tokenB}</InputRightAddon>
			</InputGroup>
			<br />
			<InputGroup>
				<Input type="amt" placeholder="amount" />
				<InputRightAddon>{tokens.tokenB}</InputRightAddon>
			</InputGroup>
			<br />
			<Button colorScheme={getColorScheme(orderType)}>{orderType}</Button>
		</div>
	);
}

function getColorScheme(type: "buy" | "sell") {
	if (type === "buy") {
		return "green";
	} else {
		return "red";
	}
}
