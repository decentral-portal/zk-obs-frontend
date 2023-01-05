import {
	InputGroup,
	Input,
	Button,
	InputRightAddon,
	Spinner,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { TsTokenAddress, TsTxLimitOrderNonSignatureRequest, TsTxLimitOrderRequest, TsTxType } from "zk-obs-sdk";
import { Available, OrderType } from "../config";
import { TsAccountContext } from "./TsAccountProvider";
import { useSigner } from "wagmi";
import { BigNumber, utils } from "ethers";
import { useSignLimitOrderReq } from "../hooks/useSignLimitOrder";
import axios from "axios";
import { ZK_OBS_API_BASE_URL } from "../config";
import { tokenFilter } from "./utils";
import { useMemo } from 'react';
const PLACE_ORDER_URL = `${ZK_OBS_API_BASE_URL}/v1/ts/transaction/placeOrder`;


async function sendPlaceOrderReq(orderInfo: TsTxLimitOrderRequest) {
	return await axios.post(PLACE_ORDER_URL, orderInfo);
};

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
	const pairToken = (orderType === OrderType.BUY) ? {
		sellTokenId: TsTokenAddress.USD,
		buyTokenId: TsTokenAddress.WETH,
	} :  {
		sellTokenId: TsTokenAddress.WETH,
		buyTokenId: TsTokenAddress.USD,
	};
	const { data: signer } = useSigner();
	const { tsAccount, profile, nonce, addNonce, fetchTsAccount } =
		useContext(TsAccountContext);
	const [price, setPrice] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [available, setAvailable] = useState<Available>({
		goerliETH: "0",
		testUSD: "0",
	});
	const [amountInfo, setAmountInfo] = useState({
		sellAmt: "",
		buyAmt: "",
	});

	const orderInfo = useMemo<TsTxLimitOrderNonSignatureRequest>(() => ({
		reqType: TsTxType.LIMIT_ORDER,
		sellAmt: amountInfo.sellAmt,
		buyAmt: amountInfo.buyAmt,
		sellTokenId: pairToken.sellTokenId,
		buyTokenId: pairToken.buyTokenId,
		sender: profile?.accountId,
		nonce: nonce.toString(),
	}), [amountInfo, profile, nonce,]);

	const {
		signTypedDataAsync,
		signature: ecdsaSig,
		reset,
	} = useSignLimitOrderReq(orderInfo);

	/** available amount */
	useEffect(() => {
		if (signer && tsAccount && profile) {
			const ethLeaf = tokenFilter(profile.tokenLeafs, TsTokenAddress.WETH);
			const ethAmt = ethLeaf[0]?.amount || "0";
			const usdLeaf = tokenFilter(profile.tokenLeafs, TsTokenAddress.USD);
			const usdAmt = usdLeaf[0]?.amount || "0";
			setAvailable({
				goerliETH: ethAmt,
				testUSD: usdAmt,
			});
		}
	}, [signer, tsAccount, profile]);

	/* amountInfo */
	const setAmt = (amount: string) => {
		const buyAmt = getBuyAmt(price, amount);
		setAmountInfo({
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

			try {
				const req = tsAccount.prepareTxLimitOrder(
					orderInfo.sender,
					orderInfo.sellTokenId,
					orderInfo.sellAmt,
					orderInfo.nonce,
					orderInfo.buyTokenId,
					orderInfo.buyAmt
				);
				const signature = await signTypedDataAsync();
				req.ecdsaSig = signature;
				console.log({
					req
				})
				reset();
				await sendPlaceOrderReq(req);
				fetchTsAccount();
				addNonce();
			} catch (error) {
				console.error(error);
				reset();
				setIsLoading(false);
				fetchTsAccount();
				addNonce();
			}
		}
	};

	return (
		<div style={STYLES.CONTAINER}>
			<InputGroup>
				<Input
					type="number"
					placeholder="price"
					onChange={(e) => {
						console.log("up", e.target.value);
						setPrice(e.target.value);
					}}
				/>
				<InputRightAddon>{tokens.tokenB}</InputRightAddon>
			</InputGroup>
			<br />
			<span style={STYLES.SPAN}>
				Available:&nbsp;
				{orderType == OrderType.BUY
					? Number(utils.formatEther(available.testUSD)).toFixed(4)
					: Number(utils.formatEther(available.goerliETH)).toFixed(4)}
			</span>
			<InputGroup>
				<Input
					type="number"
					placeholder="amount"
					onChange={(e) => {
						console.log("e.target.value", e.target.value);
						console.log({
							t: utils.parseEther(e.target.value).toString(),
						})
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
