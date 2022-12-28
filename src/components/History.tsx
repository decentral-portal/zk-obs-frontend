import {
	TableContainer,
	Table,
	TableCaption,
	Thead,
	Tr,
	Th,
	Tbody,
	Td,
	Tfoot,
} from "@chakra-ui/react";
import React from "react";
import HistoryOrders from "../data/historyOrders.json";

const STYLES = {
	CONTAINER: {
		display: "flex",
		flexDirection: "column" as const,
		justifyContent: "center",
		backgroundColor: "lightgray",
		width: "80%",
		margin: "1rem auto",
		borderRadius: "12px",
	},
};

export default function History() {
	return (
		<div style={STYLES.CONTAINER}>
			<TableContainer>
				<Table variant="simple" size="sm">
					<Thead>
						<Tr>
							<Th>Date</Th>
							<Th>Pair</Th>
							<Th>Type</Th>
							<Th>Buy/Sell</Th>
							<Th>Price</Th>
							<Th>Amount</Th>
							<Th>State</Th>
						</Tr>
					</Thead>
					<Tbody>
						{HistoryOrders.map((order) => (
							<Tr key={order.txId}>
								<Td>{order.date}</Td>
								<Td>{order.pair}</Td>
								<Td>{order.type}</Td>
								<Td>{order.orderType}</Td>
								<Td>{order.price}</Td>
								<Td>{order.amount}</Td>
								<Td>{order.state}</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
		</div>
	);
}
