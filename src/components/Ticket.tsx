import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import React from "react";
import OrderBox from "./OrderBox";
import { MarketType } from "../config";

const STYLES = {
	CONTAINER: {
		display: "flex",
		flexDirection: "column" as const,
		justifyContent: "center",
		backgroundColor: "lightgray",
		margin: "1rem auto",
		width: "80%",
		borderRadius: "12px",
	},
};

const TOKENS = {
	tokenA: "goerliETH",
	tokenB: "testUSD",
};

export default function Ticket() {
	return (
		<div style={STYLES.CONTAINER}>
			<Tabs variant="soft-rounded" colorScheme="green">
				<TabList>
					<Tab>Limited Order</Tab>
					<Tab>Market Order</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<OrderBox marketType={MarketType.LIMIT} tokens={TOKENS} />
					</TabPanel>
					<TabPanel>
						<OrderBox marketType={MarketType.MARKET} tokens={TOKENS} />
					</TabPanel>
				</TabPanels>
			</Tabs>
		</div>
	);
}
