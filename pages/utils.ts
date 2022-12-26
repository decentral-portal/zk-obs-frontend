import { Contract, Signer } from "ethers";
import ERC20_ABI from "../abis/erc20_abi.json";

export const fetchBalance = async (tokenAddr: string, signer: Signer) => {
  const token = new Contract(tokenAddr, ERC20_ABI, signer);
  const balance = await token.balanceOf(await signer.getAddress());
  return balance;
};