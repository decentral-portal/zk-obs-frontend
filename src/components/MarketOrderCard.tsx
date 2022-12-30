import {
	InputGroup,
	Input,
	Button,
	InputRightAddon,
	Spinner,
} from "@chakra-ui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { TsTokenAddress, TsTxMarketOrderRequest, TsTxType } from "zk-obs-sdk";
import { OrderType } from "../config";
import { TsAccountContext } from "./TsAccountProvider";
import { useSigner } from "wagmi";
import { useSignMarketOrderReq } from "../hooks/useSignMarketOrder";

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
		if (signer && tsAccount) {
			setOrderInfo({
				...orderInfo,
				sender: "",
				nonce: nonce.toString(),
			});
		}
	}, [nonce, signer, tsAccount]);

	const setAmt = (amount: string) => {
		setOrderInfo({
			...orderInfo,
			sellAmt: amount.toString(),
		});
	};

	const handleOrder = useCallback(async () => {
		if (signer && tsAccount) {
			setIsLoading(true);
			const req = tsAccount.prepareTxMarketOrder(
				orderInfo.sender,
				orderInfo.sellTokenId,
				orderInfo.sellAmt,
				orderInfo.nonce,
				orderInfo.buyTokenId
			);
			console.log("req", req);
			setOrderInfo({
				...orderInfo,
				eddsaSig: req.eddsaSig,
			});
			try {
				await signTypedDataAsync();
			} catch (error) {
				setIsLoading(false);
				console.error(error);
			}
		}
	}, [signer, tsAccount, signTypedDataAsync]);

	useEffect(() => {
		if (isSuccess && ecdsaSig) {
			console.log("orderInfo", orderInfo);
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
			addNonce();
		}
	}, [orderInfo]);

	return (
		<div style={STYLES.CONTAINER}>
			<InputGroup>
				<Input type="price" placeholder="market price" isDisabled />
				<InputRightAddon>{tokens.tokenB}</InputRightAddon>
			</InputGroup>
			<br />
			<span style={STYLES.SPAN}>Available: </span>
			<InputGroup>
				<Input
					type="amt"
					placeholder="amount"
					onChange={(e) => {
						setAmt(e.target.value);
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
