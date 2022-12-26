export const APP_ALCHEMY_ID = getString(process.env.NEXT_PUBLIC_ALCHEMY_ID);
export const TEST_USD_CONTRACT_ADDR = "0x5a8f799513f8806dd14ed4d374faded660ebc24f"
  

function getString(value: any, defaultValue?: string) {
  if (typeof value === 'string') return value;
  if (defaultValue !== undefined) return defaultValue;
  throw new Error(`Missing environment variable`);
}
