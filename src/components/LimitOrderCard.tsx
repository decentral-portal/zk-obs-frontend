import {
	InputGroup,
	Input,
	Button,
	InputRightAddon,
	Spinner,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { TsTokenAddress, TsTxLimitOrderRequest, TsTxType } from "zk-obs-sdk";
import { Available, OrderType } from "../config";
import { TsAccountContext } from "./TsAccountProvider";
import { useSigner } from "wagmi";
import { BigNumber, utils } from "ethers";
import { useSignLimitOrderReq } from "../hooks/useSignLimitOrder";
import axios from "axios";
import { ZK_OBS_API_BASE_URL } from "../config";

const STYLES = {
	CONTAINER: {
		display: "flex",
		flexDirection: "column" as const,
		backgroundColor: "lightgray",
		width: "40%",
	},
	SPAN: {
		margin: "0 0.5rem",
		fontSize: "0.6rem",
		color: "gray",
	},
};

interface OrderCardProps {
	orderType: OrderType.BUY | OrderType.SELL;
	tokens: {
		tokenA: string;
		tokenB: string;
	};
}

export default function LimitOrderCard(props: OrderCardProps) {
	const { orderType, tokens } = props;
	const { data: signer } = useSigner();
	const { tsAccount, profile, nonce, addNonce, fetchTsAccount } =
		useContext(TsAccountContext);
	const [price, setPrice] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [available, setAvailable] = useState<Available>({
		goerliETH: "0",
		testUSD: "0",
	});
	const [orderInfo, setOrderInfo] = useState<TsTxLimitOrderRequest>({
		reqType: TsTxType.LIMIT_ORDER,
		sender: "",
		sellTokenId: TsTokenAddress.UNKNOWN,
		sellAmt: "",
		nonce: "",
		buyTokenId: TsTokenAddress.UNKNOWN,
		buyAmt: "",
		eddsaSig: {
			R8: ["", ""],
			S: "",
		},
		ecdsaSig: "",
	});
	const {
		signature: ecdsaSig,
		isSuccess,
		reset,
		signTypedDataAsync,
	} = useSignLimitOrderReq(
		orderInfo.sender,
		orderInfo.sellTokenId,
		orderInfo.sellAmt,
		orderInfo.nonce,
		orderInfo.buyTokenId,
		orderInfo.buyAmt
	);

	useEffect(() => {
		if (orderType === OrderType.BUY) {
			setOrderInfo({
				...orderInfo,
				sellTokenId: TsTokenAddress.USD,
				buyTokenId: TsTokenAddress.WETH,
			});
		} else if (orderType === OrderType.SELL) {
			setOrderInfo({
				...orderInfo,
				sellTokenId: TsTokenAddress.WETH,
				buyTokenId: TsTokenAddress.USD,
			});
		} else {
			return;
		}
	}, []);

	useEffect(() => {
		if (signer && tsAccount && profile) {
			setOrderInfo({
				...orderInfo,
				sender: profile.accountId,
				nonce: nonce.toString(),
			});
			setAvailable({
				goerliETH: profile.tokenLeafs[0].amount || "0",
				testUSD: profile.tokenLeafs[1].amount || "0",
			});
		}
	}, [nonce, signer, tsAccount, profile]);

	const setAmt = (amount: string) => {
		const buyAmt = getBuyAmt(price, amount);
		setOrderInfo({
			...orderInfo,
			sellAmt: amount,
			buyAmt: buyAmt,
		});
	};

	const getBuyAmt = (price: string, sellAmt: string): string => {
		if (price === "" || sellAmt === "") {
			return "";
		} else {
			if (orderType === OrderType.BUY) {
				const buyAmt = BigNumber.from(sellAmt).div(BigNumber.from(price));
				return buyAmt.toString();
			} else if (orderType === OrderType.SELL) {
				const buyAmt = BigNumber.from(sellAmt).mul(BigNumber.from(price));
				return buyAmt.toString();
			} else {
				return "";
			}
		}
	};

	const handleOrder = async () => {
		if (signer && tsAccount && profile) {
			setIsLoading(true);
			const req = tsAccount.prepareTxLimitOrder(
				orderInfo.sender,
				orderInfo.sellTokenId,
				orderInfo.sellAmt,
				orderInfo.nonce,
				orderInfo.buyTokenId,
				orderInfo.buyAmt
			);
			setOrderInfo({
				...orderInfo,
				eddsaSig: req.eddsaSig,
			});
			try {
				const res = await signTypedDataAsync();
			} catch (error) {
				setIsLoading(false);
				console.error(error);
			}
		}
	};

	useEffect(() => {
		if (isSuccess && ecdsaSig) {
			setIsLoading(false);
			setOrderInfo({
				...orderInfo,
				ecdsaSig: ecdsaSig,
			});
			reset();
		}
	}, [isSuccess, ecdsaSig, orderInfo]);

	useEffect(() => {
		if (orderInfo.ecdsaSig !== "") {
			console.log("orderInfo", orderInfo);
			const url = `${ZK_OBS_API_BASE_URL}/v1/ts/transaction/placeOrder`;
			try {
				const res = placeOrder(url, orderInfo).then((res) => {
					setOrderInfo({
						...orderInfo,
						ecdsaSig: "",
					});
					fetchTsAccount();
					addNonce();
				});
			} catch (error) {
				console.error(error);
			}
		}
	}, [addNonce, orderInfo]);

	const placeOrder = async (url: string, orderInfo: TsTxLimitOrderRequest) => {
		try {
			const res = await axios.post(url, orderInfo);
			return res;
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div style={STYLES.CONTAINER}>
			<InputGroup>
				<Input
					type="price"
					placeholder="price"
					onChange={(e) => {
						setPrice(e.target.value);
					}}
				/>
				<InputRightAddon>{tokens.tokenB}</InputRightAddon>
			</InputGroup>
			<br />
			<span style={STYLES.SPAN}>
				Available:&nbsp;
				{orderType == OrderType.BUY
					? Number(utils.formatEther(available.goerliETH)).toFixed(4)
					: Number(utils.formatEther(available.testUSD)).toFixed(4)}
			</span>
			<InputGroup>
				<Input
					type="amt"
					placeholder="amount"
					onChange={(e) => {
						setAmt(utils.parseEther(e.target.value).toString());
					}}
				/>
				<InputRightAddon>
					{orderType === OrderType.BUY ? tokens.tokenB : tokens.tokenA}
				</InputRightAddon>
			</InputGroup>
			<br />
			<Button
				colorScheme={getColorScheme(orderType)}
				onClick={() => handleOrder()}
				disabled={isLoading}
			>
				{isLoading ? <Spinner /> : orderType}
			</Button>
		</div>
	);
}

function getColorScheme(type: OrderType) {
	if (type === OrderType.BUY) {
		return "green";
	} else {
		return "red";
	}
}
