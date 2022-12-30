import { useEffect, useState } from 'react';
import { ZK_OBS_CONTRACT_ADDRESS, VALID_CHAIN } from '../config';
import { useSignTypedData } from 'wagmi';
import { TsTokenAddress, TsTxType } from 'zk-obs-sdk';

export const useSignWithdraw = (
  sender: string,
  tokenId: TsTokenAddress,
  stateAmt: string,
  nonce: string,
) => {
  const [typedData, setTypedData] = useState<any>({
    domain: {},
    types: {},
    value: {},
  });

  useEffect(() => {
    setTypedData({
      domain: {
        name: 'zkOBS',
        version: '1',
        chainId: VALID_CHAIN.id,
        verifyingContract: ZK_OBS_CONTRACT_ADDRESS,
      },
      types: {
        Main: [
          { name: 'Action', type: 'string' },
          { name: 'reqType', type: 'string' },
          { name: 'sender', type: 'string' },
          { name: 'tokenId', type: 'string' },
          { name: 'stateAmt', type: 'string' },
          { name: 'nonce', type: 'string' },
        ],
      },
      value: {
        Action: 'Send Withdraw Request',
        reqType: TsTxType.WITHDRAW,
        sender: sender,
        tokenId: tokenId,
        stateAmt: stateAmt,
        nonce: nonce,
      },
    });
  }, [nonce, sender, stateAmt, tokenId]);

  const {
    data: signature,
    isError,
    isLoading,
    isSuccess,
    reset,
    signTypedDataAsync,
  } = useSignTypedData({
    domain: typedData.domain,
    types: typedData.types,
    value: typedData.value,
  });
  return { signature, isError, isLoading, isSuccess, reset, signTypedDataAsync };
};
