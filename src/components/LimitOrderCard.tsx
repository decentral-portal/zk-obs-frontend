import { InputGroup, Input, Button, InputRightAddon } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import {
	TsTokenAddress,
	TsTxLimitOrderNonSignatureRequest,
	TsTxLimitOrderRequest,
	TsTxMarketOrderNonSignatureRequest,
	TsTxMarketOrderRequest,
	TsTxType,
} from "zk-obs-sdk";
import { MarketType, OrderType } from "../config";
import { TsAccountContext } from "./TsAccountProvider";
import { useSigner } from "wagmi";
import { BigNumber } from "ethers";

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
	const { tsAccount, profile, nonce, addNonce } = useContext(TsAccountContext);
	const [price, setPrice] = useState<string>("");
	const [orderInfo, setOrderInfo] = useState<TsTxLimitOrderRequest>({
		reqType: TsTxType.UNKNOWN,
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

	useEffect(() => {
		setOrderInfo({
			...orderInfo,
			reqType: TsTxType.LIMIT_ORDER,
		});
	}, []);

	useEffect(() => {
		if (orderType === OrderType.BUY) {
			setOrderInfo({
				...orderInfo,
				sellTokenId: TsTokenAddress.USD,
				buyTokenId: TsTokenAddress.WETH,
			});
		} else {
			setOrderInfo({
				...orderInfo,
				sellTokenId: TsTokenAddress.WETH,
				buyTokenId: TsTokenAddress.USD,
			});
		}
	}, []);

	const setAmt = (amount: string) => {
		if (orderType === OrderType.BUY) {
			setOrderInfo({
				...orderInfo,
				sellAmt: amount,
			});
		} else {
			setOrderInfo({
				...orderInfo,
				sellAmt: amount,
			});
		}
	};

	const handleOrder = () => {
		if (signer && profile && tsAccount) {
			setOrderInfo({
				...orderInfo,
				sender: profile.l2Addr,
				nonce: nonce.toString(),
			});
			const buyAmt = getBuyAmt(price, orderInfo.sellAmt);
			if (buyAmt !== "") {
				setOrderInfo({
					...orderInfo,
					buyAmt: buyAmt,
				});
				const req = tsAccount.prepareTxLimitOrder(
					orderInfo.sender,
					orderInfo.sellTokenId,
					orderInfo.sellAmt,
					orderInfo.nonce,
					orderInfo.buyTokenId,
					orderInfo.buyAmt
				);
			}
		}
	};

	const getBuyAmt = (price: string, sellAmt: string): string => {
		if (price === "" || sellAmt === "") {
			return "";
		} else {
			if (orderType === OrderType.BUY) {
				const buyAmt = BigNumber.from(sellAmt).div(BigNumber.from(price));
				return buyAmt.toString();
			} else {
				const buyAmt = BigNumber.from(sellAmt).mul(BigNumber.from(price));
				return buyAmt.toString();
			}
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
			>
				{orderType}
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
