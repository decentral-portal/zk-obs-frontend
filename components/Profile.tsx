import {
	Table,
	TableCaption,
	TableContainer,
	Tbody,
	Td,
	Tfoot,
	Th,
	Thead,
	Tr,
} from "@chakra-ui/react";
import { utils } from "ethers";
import { parseEther } from "ethers/lib/utils.js";
import React, { useMemo, useState } from "react";
import { useSigner } from "wagmi";

const STYLES = {
	CONTAINER: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		margin: "1rem auto",
	},
};

export default function Profile() {
	const { data: signer } = useSigner();
	const [balance, setBalance] = useState<string>("0");

	useMemo(async () => {
		if (signer) {
			const balance = await signer.getBalance();
			setBalance(utils.formatEther(balance).slice(0, 5));
		}
	}, [signer]);

	return (
		<div style={STYLES.CONTAINER}>
			<TableContainer>
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th></Th>
							<Th>L1 Balance</Th>
							<Th>L2 Available</Th>
						</Tr>
					</Thead>
					<Tbody>
						<Tr>
							<Td>goerliETH</Td>
							<Td>{balance}</Td>
							<Td>100</Td>
						</Tr>
						<Tr>
							<Td>testUSD</Td>
							<Td>100</Td>
							<Td>100</Td>
						</Tr>
					</Tbody>
				</Table>
			</TableContainer>
		</div>
	);
}
