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
import { formatEther, parseEther } from "ethers/lib/utils.js";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSigner } from "wagmi";
import { Button, Spinner, useToast } from "@chakra-ui/react";
import { BigNumber, ethers, utils } from "ethers";
import TEST_USD_CNOTRACT_ABI from "../../abis/testUSD_abi.json";
import ZK_OBS_CONTRACT_ABI from "../../abis/zkOBS_abi.json";
import {
	TEST_USD_CONTRACT_ADDR,
	TokenLabel,
	ZK_OBS_CONTRACT_ADDRESS,
} from "../../config";
import { fetchAccountId, fetchApprovedAmt, fetchBalance } from "../utils";
import styles from "./Profile.module.css";
import { TsAccountContext } from "../TsAccountProvider";

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
	const { tsAccount } = useContext(TsAccountContext);
	const [isLoading, setIsLoading] = useState({
		approve: false,
		deposit: false,
		withdraw: false,
		mint: false,
	});
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

	const updateBalance = async () => {
		if (signer) {
			const ethBalance = await signer.getBalance();
			const testUSDBalance = await fetchBalance(TEST_USD_CONTRACT_ADDR, signer);
			setBalance({
				goerliETH: utils.formatEther(ethBalance).slice(0, 6),
				testUSD: utils.formatEther(testUSDBalance).slice(0, 6),
			});
		}
	};

	useEffect(() => {
		updateBalance();
	}, [signer]);

	const mint = async () => {
		if (signer)
			try {
				setIsLoading({ ...isLoading, mint: true });
				const contract = new ethers.Contract(
					TEST_USD_CONTRACT_ADDR,
					TEST_USD_CNOTRACT_ABI,
					signer
				);
				const mintAmt = utils.parseUnits("1000", 18);
				const res = await contract.mint(mintAmt);
				const txReceipt = await res.wait();
				updateBalance();
				if (txReceipt.transactionHash) {
					setIsLoading({ ...isLoading, mint: false });
					toast({
						title: "Minted 1000 testUSD",
						status: "success",
						position: "top",
						duration: 5000,
						isClosable: true,
					});
				}
			} catch (error) {
				setIsLoading({ ...isLoading, mint: false });
				toast({
					title: "Error minting testUSD",
					status: "error",
					position: "top",
					duration: 5000,
					isClosable: true,
				});
			}
	};

	const handleDeposit = async () => {
		if (signer && tsAccount) {
			const accountId = await fetchAccountId(signer);
			setIsLoading({ ...isLoading, deposit: true });
			const l2Addr = tsAccount.tsAddr;
			const depositAmt = depositInfo.amount;
			const contract = new ethers.Contract(
				ZK_OBS_CONTRACT_ADDRESS,
				ZK_OBS_CONTRACT_ABI,
				signer
			);
			if (depositInfo.token === TokenLabel.goerliETH) {
				if (accountId === 0) {
					try {
						const res = await contract.registerETH(l2Addr, depositAmt);
						const txReceipt = await res.wait();
						updateBalance();
						if (txReceipt.transactionHash) {
							setIsLoading({ ...isLoading, deposit: false });
							toast({
								title: `Deposited ${formatEther(depositInfo.amount)} goerliETH`,
								status: "success",
								position: "top",
								duration: 5000,
								isClosable: true,
							});
						}
					} catch (error) {
						setIsLoading({ ...isLoading, deposit: false });
						toast({
							title: "Error depositing goerliETH",
							status: "error",
							position: "top",
							duration: 5000,
							isClosable: true,
						});
					}
				} else {
					try {
						const res = await contract.depositETH(depositAmt);
						const txReceipt = await res.wait();
						updateBalance();
						if (txReceipt.transactionHash) {
							setIsLoading({ ...isLoading, deposit: false });
							toast({
								title: `Deposited ${formatEther(depositInfo.amount)} goerliETH`,
								status: "success",
								position: "top",
								duration: 5000,
								isClosable: true,
							});
						}
					} catch (error) {
						setIsLoading({ ...isLoading, deposit: false });
						toast({
							title: "Error depositing goerliETH",
							status: "error",
							position: "top",
							duration: 5000,
							isClosable: true,
						});
					}
				}
			} else {
				if (accountId === 0) {
					try {
						const res = await contract.registerERC20(
							l2Addr,
							TEST_USD_CONTRACT_ADDR,
							depositAmt
						);
						const txReceipt = await res.wait();
						updateBalance();
						if (txReceipt.transactionHash) {
							setIsLoading({ ...isLoading, deposit: false });
							toast({
								title: `Deposited ${formatEther(depositInfo.amount)} testUSD`,
								status: "success",
								position: "top",
								duration: 5000,
								isClosable: true,
							});
						}
					} catch (error) {
						setIsLoading({ ...isLoading, deposit: false });
						toast({
							title: "Error depositing testUSD",
							status: "error",
							position: "top",
							duration: 5000,
							isClosable: true,
						});
					}
				} else {
					try {
						const res = await contract.depositERC20(
							TEST_USD_CONTRACT_ADDR,
							depositAmt
						);
						const txReceipt = await res.wait();
						updateBalance();
						if (txReceipt.transactionHash) {
							setIsLoading({ ...isLoading, deposit: false });
							toast({
								title: `Deposited ${formatEther(depositInfo.amount)} testUSD`,
								status: "success",
								position: "top",
								duration: 5000,
								isClosable: true,
							});
						}
					} catch (error) {
						setIsLoading({ ...isLoading, deposit: false });
						toast({
							title: "Error depositing testUSD",
							status: "error",
							position: "top",
							duration: 5000,
							isClosable: true,
						});
					}
				}
			}
		}
	};

	const handleApprove = async () => {
		if (signer)
			try {
				setIsLoading({ ...isLoading, approve: true });
				const contract = new ethers.Contract(
					TEST_USD_CONTRACT_ADDR,
					TEST_USD_CNOTRACT_ABI,
					signer
				);
				const res = await contract.approve(
					ZK_OBS_CONTRACT_ADDRESS,
					ethers.constants.MaxUint256
				);
				const txReceipt = await res.wait();
				updateBalance();
				setIsApproved(true);
				if (txReceipt.transactionHash) {
					setIsLoading({ ...isLoading, approve: false });
					toast({
						title: "Approved testUSD",
						status: "success",
						position: "top",
						duration: 5000,
						isClosable: true,
					});
				}
			} catch (error) {
				setIsLoading({ ...isLoading, approve: false });
				toast({
					title: "Error approving testUSD",
					status: "error",
					position: "top",
					duration: 5000,
					isClosable: true,
				});
			}
	};

	const selectDepositToken = (token: TokenLabel) => {
		setDepositInfo({ ...depositInfo, token });
	};

	const selectWithdrawToken = (token: TokenLabel) => {
		setWithdrawInfo({ ...withdrawInfo, token });
	};

	const setDepositAmount = (amount: string) => {
		if (amount === "") {
			setDepositInfo({ ...depositInfo, amount: "0" });
		} else {
			amount = parseEther(amount).toString();
			setDepositInfo({ ...depositInfo, amount });
		}
	};

	useMemo(async () => {
		if (signer) {
			const approvedAmt = await fetchApprovedAmt(
				TEST_USD_CONTRACT_ADDR,
				ZK_OBS_CONTRACT_ADDRESS,
				signer
			);
			setApprovedAmt(approvedAmt);
		}
	}, [signer]);

	useEffect(() => {
		if (signer) {
			if (depositInfo.token === TokenLabel.goerliETH) {
				setIsApproved(true);
			} else {
				if (
					BigNumber.from(approvedAmt).gte(BigNumber.from(depositInfo.amount))
				) {
					setIsApproved(true);
				} else {
					setIsApproved(false);
				}
			}
		}
	}, [depositInfo, approvedAmt, signer]);

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
								<Td>{available.goerliETH}</Td>
							</Tr>
							<Tr>
								<Td>testUSD</Td>
								<Td>{balance.testUSD}</Td>
								<Td>{available.testUSD}</Td>
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
					{isApproved ? (
						<Button
							width="150px"
							colorScheme="blue"
							onClick={() => handleDeposit()}
							disabled={isLoading.deposit}
						>
							{isLoading.deposit ? <Spinner /> : "Deposit"}
						</Button>
					) : (
						<Button
							width="150px"
							colorScheme="blue"
							onClick={() => handleApprove()}
							disabled={isLoading.approve}
						>
							{isLoading.approve ? <Spinner /> : "Approve"}
						</Button>
					)}
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
				<Button
					colorScheme="blue"
					onClick={() => mint()}
					disabled={isLoading.mint}
				>
					{isLoading.mint ? <Spinner /> : "Mint 1000 testUSD"}
				</Button>
			</div>
		</div>
	);
}
