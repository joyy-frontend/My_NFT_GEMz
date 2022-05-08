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

interface MyGemCardProps extends IGemData {}

const MyGemCard: FC<MyGemCardProps> = ({
  gemRank,
  gemType,
  tokenId,
  tokenPrice,
}) => {
  const [metadataURI, setMetadataURI] = useState<IGemMetadata | undefined>(
    undefined
  );

  const [sellPrice, setSellPrice] = useState<string>('');
  const [myGemPrice, setMyGemPrice] = useState<string>(tokenPrice);
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

  const onClickSell = async () => {
    try {
      if (!account || !saleGemTokenContract || !caver) return;

      const response = await caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: account,
        to: SALE_GEM_TOKEN_ADDRESS,
        gas: '3000000',
        data: saleGemTokenContract.methods
          .setForSaleGemToken(
            tokenId,
            caver.utils.convertToPeb(sellPrice, 'KLAY')
          )
          .encodeABI(),
      });

      if (response.status) {
        setMyGemPrice(caver.utils.convertToPeb(sellPrice, 'KLAY'));
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
      {myGemPrice === '0' ? (
        <>
          <InputGroup>
            <Input
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
            />
            <InputRightAddon>Klay</InputRightAddon>
          </InputGroup>
          <Button size="sm" mt={2} onClick={onClickSell}>
            Sell
          </Button>
        </>
      ) : (
        <Text>{caver?.utils.convertFromPeb(myGemPrice, 'KLAY')} Klay</Text>
      )}
    </Box>
  );
};

export default MyGemCard;
