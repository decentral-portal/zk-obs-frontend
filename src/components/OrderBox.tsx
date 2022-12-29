import React from "react";
import LimitOrderCard from "./LimitOrderCard";
import { MarketType, OrderType } from "../config";
import MarketOrderCard from "./MarketOrderCard";

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
	marketType: MarketType;
	tokens: {
		tokenA: string;
		tokenB: string;
	};
}

export default function OrderBox(props: OrderBoxProps) {
	const { marketType, tokens } = props;
	return (
		<div style={STYLES.CONTAINER}>
			{marketType === MarketType.LIMIT ? (
				<>
					<LimitOrderCard orderType={OrderType.BUY} tokens={tokens} />
					<LimitOrderCard orderType={OrderType.SELL} tokens={tokens} />
				</>
			) : (
				<>
					<MarketOrderCard orderType={OrderType.BUY} tokens={tokens} />
					<MarketOrderCard orderType={OrderType.SELL} tokens={tokens} />
				</>
			)}
		</div>
	);
}
