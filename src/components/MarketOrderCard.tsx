import {
	InputGroup,
	Input,
	Button,
	InputRightAddon,
	Spinner,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { TsTokenAddress, TsTxMarketOrderRequest, TsTxType } from "zk-obs-sdk";
import { Available, OrderType, ZK_OBS_API_BASE_URL } from "../config";
import { TsAccountContext } from "./TsAccountProvider";
import { useSigner } from "wagmi";
import { useSignMarketOrderReq } from "../hooks/useSignMarketOrder";
import { utils } from "ethers";
import axios from "axios";

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

export default function MarketOrderCard(props: OrderCardProps) {
	const { orderType, tokens } = props;
	const { data: signer } = useSigner();
	const { tsAccount, profile, nonce, addNonce } = useContext(TsAccountContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [available, setAvailable] = useState<Available>({
		goerliETH: "0",
		testUSD: "0",
	});
	const [orderInfo, setOrderInfo] = useState<TsTxMarketOrderRequest>({
		reqType: TsTxType.MARKET_ORDER,
		sender: "",
		sellTokenId: TsTokenAddress.UNKNOWN,
		sellAmt: "",
		nonce: "",
		buyTokenId: TsTokenAddress.UNKNOWN,
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
	} = useSignMarketOrderReq(
		orderInfo.sender,
		orderInfo.sellTokenId,
		orderInfo.sellAmt,
		orderInfo.nonce,
		orderInfo.buyTokenId
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
				goerliETH: profile.tokenLeafs[0]?.amount || "0",
				testUSD: profile.tokenLeafs[1]?.amount || "0",
			});
		}
	}, [nonce, signer, tsAccount]);

	const setAmt = (amount: string) => {
		setOrderInfo({
			...orderInfo,
			sellAmt: amount,
		});
	};

	const handleOrder = async () => {
		if (signer && tsAccount && profile) {
			setIsLoading(true);
			const req = tsAccount.prepareTxMarketOrder(
				orderInfo.sender,
				orderInfo.sellTokenId,
				orderInfo.sellAmt,
				orderInfo.nonce,
				orderInfo.buyTokenId
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
				const res = placeOrder(url, orderInfo);
				console.log("res", res);
				setOrderInfo({
					...orderInfo,
					ecdsaSig: "",
				});
			} catch (error) {
				console.error(error);
			}
			addNonce();
		}
	}, [addNonce, orderInfo]);

	const placeOrder = async (url: string, orderInfo: TsTxMarketOrderRequest) => {
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
				<Input type="price" placeholder="market price" isDisabled />
				<InputRightAddon>{tokens.tokenB}</InputRightAddon>
			</InputGroup>
			<br />
			<span style={STYLES.SPAN}>
				Available:&nbsp;
				{orderType == OrderType.BUY
					? utils.formatEther(available.testUSD)
					: utils.formatEther(available.goerliETH)}
			</span>
			<InputGroup>
				<Input
					type="amt"
					placeholder="amount"
					onChange={(e) => {
						setAmt(utils.parseEther(e.target.value).toString());
					}}
				/>
				{orderType === OrderType.BUY ? (
					<InputRightAddon>{tokens.tokenB}</InputRightAddon>
				) : (
					<InputRightAddon>{tokens.tokenA}</InputRightAddon>
				)}
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
