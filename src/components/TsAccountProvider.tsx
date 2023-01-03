import {
	createContext,
	useCallback,
	useMemo,
	useState,
	useEffect,
} from "react";
import { utils } from "ethers";
import { arrayify } from "ethers/lib/utils";
import {
	useAccount,
	useEnsName,
	useSwitchNetwork,
	useNetwork,
	useConnect,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import {
	PRIV_HASH_ITERATIONS,
	VALID_CHAIN,
	ZK_OBS_API_BASE_URL,
} from "../config";
import { useSignAuth } from "../hooks/useSignAuth";
import { shortenAddress } from "./utils";
import { TsRollupSigner } from "zk-obs-sdk";
import { Toast } from "@chakra-ui/react";
import axios from "axios";

export const TsAccountContext = createContext<{
	tsAccount: TsRollupSigner | undefined;
	//TODO check profile type
	profile: any;
	isAuthenticated: boolean;
	authUser: () => void;
	fetchTsAccount: () => void;
	breakTsAccount: () => void;
	nonce: number;
	addNonce: () => void;
	addressOrEnsName: string;
}>({
	tsAccount: undefined,
	profile: undefined,
	isAuthenticated: false,
	authUser: () => {},
	fetchTsAccount: () => {},
	breakTsAccount: () => {},
	nonce: 0,
	addNonce: () => {},
	addressOrEnsName: "",
});

export const TsAccountProvider = ({ children }: { children: any }) => {
	const { isConnected, address } = useAccount();
	const { signTypedDataAsync: signAuth } = useSignAuth();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [tsAccount, _setTsAccount] = useState<TsRollupSigner | undefined>(
		undefined
	);
	//TODO check profile type
	const [profile, setProfile] = useState<any>();
	const [nonce, setNonce] = useState<number>(0);
	const { data: ensName } = useEnsName({ address });
	const { chain } = useNetwork();
	const { switchNetwork } = useSwitchNetwork();
	const { data: connectData } = useConnect({
		connector: new InjectedConnector(),
	});

	const setTsAccount = useCallback((signature?: string) => {
		if (signature) {
			let hash = signature;
			for (let index = 0; index < PRIV_HASH_ITERATIONS; index++) {
				hash = utils.keccak256(arrayify(hash));
			}
			const tsPrivKeyBuf = Buffer.from(hash.replace("0x", ""), "hex");
			_setTsAccount(new TsRollupSigner(tsPrivKeyBuf));
		} else {
			_setTsAccount(undefined);
		}
	}, []);

	const authUser = useCallback(async () => {
		try {
			const sig = await signAuth();
			if (sig) {
				setTsAccount(sig);
				setIsAuthenticated(true);
			}
		} catch (error) {
			console.log("error", error);
		}
	}, [setTsAccount, signAuth]);

	const addNonce = useCallback(() => {
		if (nonce !== 0) {
			setNonce(nonce + 1);
		}
	}, [nonce]);

	const fetchTsAccount = async () => {
		if (isConnected) {
			const url = `${ZK_OBS_API_BASE_URL}/v1/ts/account/profile`;
			try {
				const res = await axios.get(url, {
					params: {
						address,
					},
				});
				if (res.data) {
					setProfile(res.data);
					const n = Number(res.data.nonce);
					if (n > nonce) {
						setNonce(n);
					}
				} else {
					setProfile(undefined);
				}
			} catch (error) {
				console.error(error);
				setProfile(undefined);
			}
		}
	};

	const breakTsAccount = useCallback(() => {
		setTsAccount(undefined);
		setIsAuthenticated(false);
		setProfile(undefined);
		setNonce(0);
	}, [setTsAccount]);

	const addressOrEnsName = useMemo(() => {
		if (ensName) {
			return ensName;
		}
		if (address) {
			return shortenAddress(address);
		}
		return "";
	}, [address, ensName]);

	useEffect(() => {
		const connectedChainId = connectData?.chain.id;
		if (connectedChainId != VALID_CHAIN.id) {
			try {
				switchNetwork?.(VALID_CHAIN.id);
			} catch (error) {
				Toast({
					title: "Error",
					description: `Plz switch to ${VALID_CHAIN.name} network`,
					position: "top",
					status: "error",
					duration: 9000,
					isClosable: true,
				});
			}
		}
	}, [connectData, switchNetwork]);

	useEffect(() => {
		if (isConnected && !isAuthenticated && chain?.id === VALID_CHAIN.id) {
			authUser();
			fetchTsAccount();
		}
	}, [isConnected, chain, authUser, isAuthenticated]);

	return (
		<TsAccountContext.Provider
			value={{
				addressOrEnsName,
				nonce,
				addNonce,
				tsAccount,
				profile,
				isAuthenticated,
				authUser,
				fetchTsAccount,
				breakTsAccount,
			}}
		>
			{children}
		</TsAccountContext.Provider>
	);
};
