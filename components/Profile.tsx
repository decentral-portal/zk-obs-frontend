import {
	Input,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from "@chakra-ui/react";
import { parseEther } from "ethers/lib/utils.js";
import React, { useMemo, useState } from "react";
import { useSigner } from "wagmi";
import { Button, Spinner, useToast } from "@chakra-ui/react";
import { BigNumber, ethers, utils } from "ethers";
import TEST_USD_CNOTRACT_ABI from "../abis/testUSD_abi.json";
import { TEST_USD_CONTRACT_ADDR } from "../pages/config";
import { fetchBalance } from "../pages/utils";

const STYLES = {
	CONTAINER: {
		display: "flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "center",
		margin: "1rem auto",
	},
	BOX: {
		display: "flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "space-between",
		width: "80%",
		padding: "1rem 0 3rem 0",
		margin: "1rem auto",
		backgroundColor: "lightgray",
		borderRadius: "12px",
	},
	CARD: {
		display: "flex",
		flexDirection: "row" as const,
		alignItems: "center",
		justifyContent: "space-around",
		width: "60%",
		margin: "1rem auto",
	},
	H1: {
		fontSize: "1.5rem",
		fontWeight: "bold" as const,
		width: "60%",
		margin: "1rem auto",
	},
};

interface Balance {
	eth: string;
	testUSD: string;
}

interface Available {
	eth: string;
	testUSD: string;
}

export default function Profile() {
	const toast = useToast();
	const { data: signer } = useSigner();
	const [isLoading, setIsLoading] = useState(false);
	const [balance, setBalance] = useState<Balance>({ eth: "0", testUSD: "0" });
	const [available, setAvailable] = useState<Available>({
		eth: "0",
		testUSD: "0",
	});

	useMemo(async () => {
		if (signer) {
			const ethBalance = await signer.getBalance();
			const testUSDBalance = await fetchBalance(TEST_USD_CONTRACT_ADDR, signer);
			setBalance({
				eth: utils.formatEther(ethBalance).slice(0, 6),
				testUSD: utils.formatEther(testUSDBalance).slice(0, 6),
			});
		}
	}, [signer]);

	const mint = async () => {
		if (signer)
			try {
				setIsLoading(true);
				const contract = new ethers.Contract(
					TEST_USD_CONTRACT_ADDR,
					TEST_USD_CNOTRACT_ABI,
					signer
				);
				const mintAmt = utils.parseUnits("1000", 18);
				const res = await contract.mint(mintAmt);
				const txReceipt = await res.wait();
				if (txReceipt.transactionHash) {
					setIsLoading(false);
					toast({
						title: "Minted 1000 testUSD",
						status: "success",
						position: "top",
						duration: 5000,
						isClosable: true,
					});
				}
			} catch (error) {
				setIsLoading(false);
				toast({
					title: "Error minting testUSD",
					status: "error",
					position: "top",
					duration: 5000,
					isClosable: true,
				});
			}
	};

	return (
		<div style={STYLES.CONTAINER}>
			<div style={STYLES.BOX}>
				<h1 style={STYLES.H1}>Profile</h1>
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
								<Td>{balance.eth}</Td>
								<Td>100</Td>
							</Tr>
							<Tr>
								<Td>testUSD</Td>
								<Td>{balance.testUSD}</Td>
								<Td>100</Td>
							</Tr>
						</Tbody>
					</Table>
				</TableContainer>
			</div>
			<div style={STYLES.BOX}>
				<h1 style={STYLES.H1}>Deposit/WithDraw</h1>
				<div style={STYLES.CARD}>
					<Input width="300px" border="2px" />
					<Button width="150px" colorScheme="blue">
						Deposit
					</Button>
				</div>
				<div style={STYLES.CARD}>
					<Input width="300px" border="2px" />
					<Button width="150px" colorScheme="blue">
						Withdraw
					</Button>
				</div>
			</div>
			<div style={STYLES.BOX}>
				<h1 style={STYLES.H1}>Faucet</h1>
				<Button colorScheme="blue" onClick={() => mint()}>
					{isLoading ? <Spinner /> : "Mint 1000 testUSD"}
				</Button>
			</div>
		</div>
	);
}
