export const APP_ALCHEMY_ID = getString(process.env.NEXT_PUBLIC_ALCHEMY_ID);

function getString(value: any, defaultValue?: string) {
  if (typeof value === 'string') return value;
  if (defaultValue !== undefined) return defaultValue;
  throw new Error(`Missing environment variable`);
}
