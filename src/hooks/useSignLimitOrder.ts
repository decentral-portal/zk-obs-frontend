import { useEffect, useMemo, useState } from 'react';
import { ZK_OBS_CONTRACT_ADDRESS, VALID_CHAIN } from '../config';
import { useSignTypedData } from 'wagmi';
import { TsTxLimitOrderNonSignatureRequest, TsTxType } from 'zk-obs-sdk';
import { TypedDataDomain, TypedDataField } from 'ethers';

export const useSignLimitOrderReq = (orderInfo: TsTxLimitOrderNonSignatureRequest) => {

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
      sender: orderInfo.sender,
      sellTokenId: orderInfo.sellTokenId,
      sellAmt: orderInfo.sellAmt,
      nonce: orderInfo.nonce,
      buyTokenId: orderInfo.buyTokenId,
      buyAmt: orderInfo.buyAmt,
    } as  Record<string, any>,
  }), [orderInfo]);

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
