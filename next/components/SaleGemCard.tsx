import {
  Box,
  Button,
  Image,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { FC, useEffect, useState } from 'react';
import { SALE_GEM_TOKEN_ADDRESS } from '../caverConfig';
import { useAccount, useCaver } from '../hooks';
import { IGemData, IGemMetadata } from '../interfaces';

interface SaleGemCardProps extends IGemData {
  getOnSaleTokens: () => Promise<void>;
}

const SaleGemCard: FC<SaleGemCardProps> = ({
  gemRank,
  gemType,
  tokenId,
  tokenPrice,
  getOnSaleTokens,
}) => {
  const [metadataURI, setMetadataURI] = useState<IGemMetadata | undefined>(
    undefined
  );

  const { account } = useAccount();

  const { caver, saleGemTokenContract } = useCaver();
  const getMetadata = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_METADATA_URI}/${gemRank}/${gemType}.json`
      );
      setMetadataURI(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onClickBuy = async () => {
    try {
      if (!account || !caver || !saleGemTokenContract) return;

      const response = await caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: account,
        to: SALE_GEM_TOKEN_ADDRESS,
        gas: '3000000',
        data: saleGemTokenContract.methods
          .purchaseGemToken(tokenId)
          .encodeABI(),
        value: tokenPrice,
      });

      if (response.status) {
        getOnSaleTokens();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getMetadata();
  }, []);

  return (
    <Box w={200}>
      <Image src={metadataURI?.image} fallbackSrc="loading.png" alt="hrGemz" />
      <Text>{metadataURI?.name}</Text>
      <Text>{metadataURI?.description}</Text>
      <Text>{caver?.utils.convertFromPeb(tokenPrice, 'KLAY')} Klay</Text>
      <Button size="sm" mt={2} onClick={onClickBuy}>
        Buy
      </Button>
    </Box>
  );
};

export default SaleGemCard;
