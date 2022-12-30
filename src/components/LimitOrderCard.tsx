import {
	InputGroup,
	Input,
	Button,
	InputRightAddon,
	Spinner,
} from "@chakra-ui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { TsTokenAddress, TsTxLimitOrderRequest, TsTxType } from "zk-obs-sdk";
import { OrderType } from "../config";
import { TsAccountContext } from "./TsAccountProvider";
import { useSigner } from "wagmi";
import { BigNumber } from "ethers";
import { useSignLimitOrderReq } from "../hooks/useSignLimitOrder";

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
	const [isLoading, setIsLoading] = useState<boolean>(false);
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
		if (signer && tsAccount) {
			setOrderInfo({
				...orderInfo,
				sender: "",
				nonce: nonce.toString(),
			});
		}
	}, [nonce, signer, tsAccount]);

	const setAmt = (amount: string) => {
		const buyAmt = getBuyAmt(price, amount);
		setOrderInfo({
			...orderInfo,
			sellAmt: amount.toString(),
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

	const handleOrder = useCallback(async () => {
		if (signer && tsAccount) {
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
				await signTypedDataAsync();
			} catch (error) {
				setIsLoading(false);
				console.error(error);
			}
		}
	}, [signer, tsAccount, signTypedDataAsync]);

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
			addNonce();
		}
	}, [orderInfo]);

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
