import { createContext, useCallback, useMemo, useState } from "react";
import { utils } from "ethers";
import { arrayify } from "ethers/lib/utils";
import { useAccount, useEnsName } from "wagmi";
import { PRIV_HASH_ITERATIONS } from "../pages/config";
import { useSignAuth } from "../hooks/useSignAuth";
import { shortenAddress } from "../pages/utils";
import { TsRollupSigner } from "../zk-obs-sdk/dist/lib/ts-rollup/ts-account";

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
		if (isConnected) {
			try {
				const sig = await signAuth();
				if (sig) {
					setTsAccount(sig);
					setIsAuthenticated(true);
				}
			} catch (error) {
				console.log("error", error);
			}
		}
	}, [setTsAccount, isConnected, signAuth]);

	const addNonce = useCallback(() => {
		if (nonce !== 0) {
			setNonce(nonce + 1);
		}
	}, [nonce]);

	const fetchTsAccount = useCallback(async () => {
		// if (isConnected) {
		//   try {
		//     const profile = await AccountService.tsAccountControllerGetAccountInfo(address);
		//     if (profile) {
		//       setProfile(profile);
		//       const n = Number(profile.nonce);
		//       if (n > nonce) {
		//         setNonce(n);
		//       }
		//     } else {
		//       setProfile(undefined);
		//     }
		//   } catch (error) {
		//     console.error(error);
		//     setProfile(undefined);
		//   }
		// }
	}, [isConnected, address, nonce]);

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
