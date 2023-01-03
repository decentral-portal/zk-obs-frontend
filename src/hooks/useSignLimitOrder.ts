import { useEffect, useMemo, useState } from 'react';
import { ZK_OBS_CONTRACT_ADDRESS, VALID_CHAIN } from '../config';
import { useSignTypedData } from 'wagmi';
import { TsTokenAddress, TsTxType } from 'zk-obs-sdk';
import { TypedDataDomain, TypedDataField } from 'ethers';

export const useSignLimitOrderReq = (
  sender: string,
  sellTokenId: string,
  sellAmt: string,
  nonce: string,
  buyTokenId: string,
  buyAmt: string,
) => {

  const typedData = useMemo(() => ({
    domain: {
      name: 'zkOBS',
      version: '1',
      chainId: VALID_CHAIN.id,
      verifyingContract: ZK_OBS_CONTRACT_ADDRESS,
    } as TypedDataDomain,
    types: {
      Main: [
        { name: 'Action', type: 'string' },
        { name: 'reqType', type: 'string' },
        { name: 'sender', type: 'string' },
        { name: 'sellTokenId', type: 'string' },
        { name: 'sellAmt', type: 'string' },
        { name: 'nonce', type: 'string' },
        { name: 'buyTokenId', type: 'string' },
        { name: 'buyAmt', type: 'string' },
      ],
    } as Record<string, Array<TypedDataField>>,
    value: {
      Action: 'Place Limit Order',
      reqType: TsTxType.LIMIT_ORDER,
      sender: sender,
      sellTokenId: sellTokenId,
      sellAmt: sellAmt,
      nonce: nonce,
      buyTokenId: buyTokenId,
      buyAmt: buyAmt,
    } as  Record<string, any>,
  }), [buyAmt, buyTokenId, nonce, sellAmt, sellTokenId, sender]);

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
  } as any);
  return { signature, isError, isLoading, isSuccess, reset, signTypedDataAsync };
};
