import { useEffect, useState } from 'react';
import { ZK_OBS_CONTRACT_ADDRESS, VALID_CHAIN } from '../config';
import { useSignTypedData } from 'wagmi';
import { TsTokenAddress, TsTxType } from 'zk-obs-sdk';

export const useSignMarketOrderReq = (
  sender: string,
  sellTokenId: string,
  sellAmt: string,
  nonce: string,
  buyTokenId: string,
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
          { name: 'sellTokenId', type: 'string' },
          { name: 'sellAmt', type: 'string' },
          { name: 'nonce', type: 'string' },
          { name: 'buyTokenId', type: 'string' },
        ],
      },
      value: {
        Action: 'Place Market Order',
        reqType: TsTxType.MARKET_ORDER,
        sender: sender,
        sellTokenId: sellTokenId,
        sellAmt: sellAmt,
        nonce: nonce,
        buyTokenId: buyTokenId,
      },
    });
  }, [buyTokenId, nonce, sellAmt, sellTokenId, sender]);

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
