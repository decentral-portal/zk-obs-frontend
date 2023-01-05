import { hardhat } from "@wagmi/chains";

export const APP_ALCHEMY_ID = getString(process.env.NEXT_PUBLIC_ALCHEMY_ID);
export const ZK_OBS_CONTRACT_ADDRESS = getString(process.env.NEXT_PUBLIC_ZK_OBS_CONTRACT);
export const ZK_OBS_API_BASE_URL = getString(process.env.NEXT_PUBLIC_ZK_OBS_API_BASE_URL);
export const TEST_USD_CONTRACT_ADDR = getString(process.env.NEXT_PUBLIC_ZK_OBS_TEST_USD_CONTRACT_ADDR);
export const PRIV_HASH_ITERATIONS = 100;
export const VALID_CHAIN = hardhat;

export enum TokenLabel {
  goerliETH = 'ETH',
  testUSD = 'USDC',
}

export enum MarketType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
}

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface Balance {
	goerliETH: string;
	testUSD: string;
}

export interface Available {
	goerliETH: string;
	testUSD: string;
}
  
function getString(value: any, defaultValue?: string) {
  if (typeof value === 'string') return value;
  if (defaultValue !== undefined) return defaultValue;
  throw new Error(`Missing environment variable`);
}
