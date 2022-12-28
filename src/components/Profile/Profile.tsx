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
import React, { Children, useEffect, useMemo, useState } from "react";
import { goerli, useSigner } from "wagmi";
import { Button, Spinner, useToast } from "@chakra-ui/react";
import { BigNumber, ethers, utils } from "ethers";
import TEST_USD_CNOTRACT_ABI from "../../abis/testUSD_abi.json";
import {
	TEST_USD_CONTRACT_ADDR,
	TokenLabel,
	ZK_OBS_CONTRACT_ADDRESS,
} from "../../pages/config";
import { fetchApprovedAmt, fetchBalance } from "../../pages/utils";
import styles from "./Profile.module.css";

const STYLES = {
	BLUE: {
		color: "#0070f3",
		cursor: "pointer",
	},
	GRAY: {
		color: "#999",
		cursor: "pointer",
	},
};

interface Balance {
	goerliETH: string;
	testUSD: string;
}

interface Available {
	goerliETH: string;
	testUSD: string;
}

export default function Profile() {
	const toast = useToast();
	const { data: signer } = useSigner();
	const [isLoading, setIsLoading] = useState(false);
	const [balance, setBalance] = useState<Balance>({
		goerliETH: "0",
		testUSD: "0",
	});
	const [available, setAvailable] = useState<Available>({
		goerliETH: "0",
		testUSD: "0",
	});
	const [depositInfo, setDepositInfo] = useState({
		token: TokenLabel.goerliETH,
		amount: "0",
	});
	const [withdrawInfo, setWithdrawInfo] = useState({
		token: TokenLabel.goerliETH,
		amount: "0",
	});
	const [approvedAmt, setApprovedAmt] = useState("0");
	const [isApproved, setIsApproved] = useState(true);

	useMemo(async () => {
		if (signer) {
			const ethBalance = await signer.getBalance();
			const testUSDBalance = await fetchBalance(TEST_USD_CONTRACT_ADDR, signer);
			setBalance({
				goerliETH: utils.formatEther(ethBalance).slice(0, 6),
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

	const handleDeposit = async () => {};

	const selectDepositToken = (token: TokenLabel) => {
		setDepositInfo({ ...depositInfo, token });
	};

	const selectWithdrawToken = (token: TokenLabel) => {
		setWithdrawInfo({ ...withdrawInfo, token });
	};

	const setDepositAmount = (amount: string) => {
		setDepositInfo({ ...depositInfo, amount });
	};

	useMemo(async () => {
		if (signer) {
			const approvedAmt = await fetchApprovedAmt(
				TEST_USD_CONTRACT_ADDR,
				ZK_OBS_CONTRACT_ADDRESS,
				signer
			);
			setApprovedAmt(utils.formatEther(approvedAmt));
			if (approvedAmt.gt(parseEther("0"))) {
				setIsApproved(true);
			} else {
				setIsApproved(false);
			}
		}
	}, [signer]);

	return (
		<div className={styles.CONTAINER}>
			<div className={styles.BOX}>
				<h1 className={styles.H1}>Profile</h1>
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
								<Td>{balance.goerliETH}</Td>
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
			<div className={styles.BOX}>
				<h1 className={styles.H1}>Deposit/WithDraw</h1>
				<div className={styles.CARD}>
					<div>
						<span
							style={
								depositInfo.token == TokenLabel.goerliETH
									? STYLES.BLUE
									: STYLES.GRAY
							}
							className={styles.SPAN}
							onClick={() => selectDepositToken(TokenLabel.goerliETH)}
						>
							goerliETH
						</span>
						<span
							style={
								depositInfo.token == TokenLabel.testUSD
									? STYLES.BLUE
									: STYLES.GRAY
							}
							className={styles.SPAN}
							onClick={() => selectDepositToken(TokenLabel.testUSD)}
						>
							testUSD
						</span>
						<Input
							width="300px"
							border="2px"
							onChange={(e) => {
								setDepositAmount(e.target.value);
							}}
						/>
					</div>
					<Button
						width="150px"
						colorScheme="blue"
						onClick={() => handleDeposit()}
					>
						{isApproved ? `Deposit` : `Approve`}
					</Button>
				</div>
				<div className={styles.CARD}>
					<div>
						<span
							style={
								withdrawInfo.token == TokenLabel.goerliETH
									? STYLES.BLUE
									: STYLES.GRAY
							}
							className={styles.SPAN}
							onClick={() => selectWithdrawToken(TokenLabel.goerliETH)}
						>
							goerliETH
						</span>
						<span
							style={
								withdrawInfo.token == TokenLabel.testUSD
									? STYLES.BLUE
									: STYLES.GRAY
							}
							className={styles.SPAN}
							onClick={() => selectWithdrawToken(TokenLabel.testUSD)}
						>
							testUSD
						</span>
						<Input width="300px" border="2px" />
					</div>
					<Button width="150px" colorScheme="blue">
						Withdraw
					</Button>
				</div>
			</div>
			<div className={styles.BOX}>
				<h1 className={styles.H1}>Faucet</h1>
				<Button colorScheme="blue" onClick={() => mint()}>
					{isLoading ? <Spinner /> : "Mint 1000 testUSD"}
				</Button>
			</div>
		</div>
	);
}
