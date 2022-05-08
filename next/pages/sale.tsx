import { Grid } from '@chakra-ui/react';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import SaleGemCard from '../components/SaleGemCard';
import { useCaver } from '../hooks';
import { IGemData } from '../interfaces';

const Sale: NextPage = () => {
  const [saleGemTokens, setSaleGemTokens] = useState<IGemData[] | undefined>(
    undefined
  );

  const { saleGemTokenContract } = useCaver();

  const getOnSaleTokens = async () => {
    try {
      if (!saleGemTokenContract) return;
      const response = await saleGemTokenContract.methods
        .getSaleGemTokens()
        .call();

      // console.log(response); // 판매등록된 토큰을 가져온다.
      setSaleGemTokens(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!saleGemTokenContract) return;
    getOnSaleTokens();
  }, [saleGemTokenContract]);
  return (
    <Grid mt={4} templateColumns="repeat(4,1fr)" gap={8}>
      {saleGemTokens?.map((v, i) => {
        return (
          <SaleGemCard
            key={i}
            gemRank={v.gemRank}
            gemType={v.gemType}
            tokenId={v.tokenId}
            tokenPrice={v.tokenPrice}
            getOnSaleTokens={getOnSaleTokens}
          />
        );
      })}
    </Grid>
  );
};

export default Sale;
