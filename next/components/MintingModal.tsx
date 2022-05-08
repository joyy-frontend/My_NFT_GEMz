import {
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { FC, useState } from 'react';
import { MINT_GEM_TOKEN_ADDRESS } from '../caverConfig';
import { useAccount, useCaver } from '../hooks';
import { IGem } from '../interfaces';

interface MintingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MintingModal: FC<MintingModalProps> = ({ isOpen, onClose }) => {
  const [metadataURI, setMetadataURI] = useState<IGem | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { account } = useAccount();
  const { caver, mintGemTokenContract } = useCaver();

  const onClickMint = async () => {
    try {
      if (!account || !caver || !mintGemTokenContract) return;
      setIsLoading(true);

      const mintGemResponse = await caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: account,
        to: MINT_GEM_TOKEN_ADDRESS,
        value: caver.utils.convertToPeb(1, 'KLAY'),
        gas: '3000000',
        data: mintGemTokenContract.methods.mintGem().encodeABI(),
      });

      if (mintGemResponse.status) {
        const getTokenResponse = await mintGemTokenContract.methods
          .getLatestMintedGem(account)
          .call();

        const metadataResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_METADATA_URI}/${getTokenResponse[0]}/${getTokenResponse[1]}.json`
        );
        setMetadataURI(metadataResponse.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>민팅하기</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {metadataURI ? (
            <>
              <Flex justifyContent="center">
                <Box w={200}>
                  <Image
                    src={metadataURI.image}
                    alt="hr-Gemz"
                    fallbackSrc="loading.png"
                  />
                  <Text>{metadataURI.name}</Text>
                  <Text>{metadataURI.description}</Text>
                </Box>
              </Flex>
            </>
          ) : (
            <>
              <Text>민팅을 진행하시겠습니까?</Text>
              <Text>(1 Klay 가 소모됩니다.)</Text>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={2}
            color="purple"
            variant="ghost"
            onClick={onClickMint}
            isLoading={isLoading}
            disabled={isLoading}
          >
            민팅하기
          </Button>
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MintingModal;
