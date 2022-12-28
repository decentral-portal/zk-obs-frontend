import React from "react";
import OrderCard from "./OrderCard";

const STYLES = {
	CONTAINER: {
		display: "flex",
		flexDirection: "row" as const,
		justifyContent: "space-around",
		backgroundColor: "transparent",
		margin: "2rem auto",
		width: "80%",
	},
};

interface OrderBoxProps {
	marketType: "limited" | "market";
	tokens: {
		tokenA: string;
		tokenB: string;
	};
}

export default function OrderBox(props: OrderBoxProps) {
	const { marketType, tokens } = props;
	return (
		<div style={STYLES.CONTAINER}>
			<OrderCard marketType={marketType} orderType="buy" tokens={tokens} />
			<OrderCard marketType={marketType} orderType="sell" tokens={tokens} />
		</div>
	);
}
