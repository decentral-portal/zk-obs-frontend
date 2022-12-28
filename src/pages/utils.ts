import { Contract, Signer, ethers } from "ethers";
import { Bytes, getAddress } from 'ethers/lib/utils';
import ERC20_ABI from "../abis/erc20_abi.json";
import { ZK_OBS_CONTRACT_ADDRESS } from "./config";
import ZK_OBS_CONTRACT_ABI from "../abis/zkOBS_abi.json";

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

export const fetchAccountId = async (signer: Signer) => {
  const contract = new Contract(ZK_OBS_CONTRACT_ADDRESS, ZK_OBS_CONTRACT_ABI, signer);
  const accountId = await contract.accountIdOf(await signer.getAddress());
  return accountId;
};

export function shortenAddress(address: string, chars = 4): string {
  const parsed = getAddress(address);
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export function getRandBytes20(): string {
  return ethers.utils.hexlify(ethers.utils.randomBytes(20));
}