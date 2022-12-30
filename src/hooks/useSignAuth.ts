import { useEffect, useState } from 'react';
import { useSignTypedData } from 'wagmi';
import { ZK_OBS_CONTRACT_ADDRESS, VALID_CHAIN } from '../config';

export const useSignAuth = () => {
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
          { name: 'Authentication', type: 'string' },
          { name: 'Action', type: 'string' },
        ],
      },
      value: {
        Authentication: 'zkOBS',
        Action: 'Authentication on zkOBS',
      },
    });
  }, []);

  const {
    data: signature,
    isError,
    isLoading,
    isSuccess,
    signTypedDataAsync,
  } = useSignTypedData({
    domain: typedData.domain,
    types: typedData.types,
    value: typedData.value,
  });
  return { signature, isError, isLoading, isSuccess, signTypedDataAsync };
};
