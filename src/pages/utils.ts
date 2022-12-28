import { Contract, Signer } from "ethers";
import { getAddress } from 'ethers/lib/utils';
import ERC20_ABI from "../abis/erc20_abi.json";

export const fetchBalance = async (tokenAddr: string, signer: Signer) => {
  const token = new Contract(tokenAddr, ERC20_ABI, signer);
  const balance = await token.balanceOf(await signer.getAddress());
  return balance;
};

export const fetchApprovedAmt = async (tokenAddr: string, spender: string, signer: Signer) => {
  const token = new Contract(tokenAddr, ERC20_ABI, signer);
  const amount = await token.allowance(await signer.getAddress(), spender);
  return amount;
};

export function shortenAddress(address: string, chars = 4): string {
  const parsed = getAddress(address);
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}