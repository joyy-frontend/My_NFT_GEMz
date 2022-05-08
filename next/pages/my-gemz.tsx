import { Box, Button, Grid, Text } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { MINT_GEM_TOKEN_ADDRESS, SALE_GEM_TOKEN_ADDRESS } from '../caverConfig';
import MyGemCard from '../components/MyGemCard';
import { useAccount, useCaver } from '../hooks';
import { IGemData } from '../interfaces';

const MyGemz: NextPage = () => {
  const [myGemz, setMyGemz] = useState<IGemData[] | undefined>(undefined);
  const [saleStatus, setSaleStatus] = useState<boolean>(false);

  const { account } = useAccount();
  const { saleGemTokenContract, mintGemTokenContract, caver } = useCaver();

  const getGemTokens = async () => {
    try {
      if (!account || !saleGemTokenContract) return;

      const response = await saleGemTokenContract.methods
        .getGemTokens(account)
        .call();

      setMyGemz(response);
    } catch (error) {
      console.error(error);
    }
  };

  const getSaleStatus = async () => {
    try {
      if (!mintGemTokenContract || !account) return;

      // account 가 SALE_GEM_TOKEN_ADDRESS에게 판매권한을 넘겼는지 체크 (return boolean) ,
      // 판매권한을 확인할때 isApprovedForAll(), 설정할때 setApprovalForAll()
      const response = await mintGemTokenContract.methods
        .isApprovedForAll(account, SALE_GEM_TOKEN_ADDRESS)
        .call();

      setSaleStatus(response);
    } catch (error) {
      console.error(error);
    }
  };

  const onClickSaleStatus = async () => {
    try {
      if (!account || !mintGemTokenContract || !caver) return;
      const response = await caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: account,
        to: MINT_GEM_TOKEN_ADDRESS,
        gas: '3000000',
        data: mintGemTokenContract.methods
          .setApprovalForAll(SALE_GEM_TOKEN_ADDRESS, !saleStatus)
          .encodeABI(),
      });
      if (response.status) {
        setSaleStatus(!saleStatus);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!account || !saleGemTokenContract) return;
    getGemTokens();
  }, [account, saleGemTokenContract]);

  useEffect(() => {
    if (!account || !mintGemTokenContract) return;
    getSaleStatus();
  }, [account, mintGemTokenContract]);
  return (
    <>
      <Box textAlign="center">
        <Text d="inline-block">
          Sale Status: {saleStatus ? 'True' : 'False'}
        </Text>
        <Button
          size="xs"
          ml={2}
          colorScheme={saleStatus ? 'red' : 'blue'}
          onClick={onClickSaleStatus}
        >
          {saleStatus ? 'Cancel' : 'Approve'}
        </Button>
      </Box>
      <Grid
        mt={4}
        templateColumns="repeat(4, 1fr)"
        gap={8}
        justifyContent="center"
      >
        {myGemz?.map((v, i) => {
          return (
            <MyGemCard
              key={i}
              gemRank={v.gemRank}
              gemType={v.gemType}
              tokenId={v.tokenId}
              tokenPrice={v.tokenPrice}
            />
          );
        })}
      </Grid>
    </>
  );
};

export default MyGemz;
