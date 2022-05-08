import { Box, Button, Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FC } from 'react';
import { useAccount } from '../hooks';

const Header: FC = () => {
  const { account } = useAccount();
  return (
    <Flex w="full" p={4} justifyContent="space-between" bg="red.100">
      <Box>hrGemz</Box>
      <Box>
        <Link href="/">
          <Button size="sm" variant="ghost">
            Minting
          </Button>
        </Link>
        <Link href="my-gemz">
          <Button size="sm" variant="ghost" ml={2}>
            My Gemz
          </Button>
        </Link>
        <Link href="sale">
          <Button size="sm" variant="ghost" ml={2}>
            Sale
          </Button>
        </Link>
      </Box>
      <Box>
        <Text fontSize="sm">
          {account
            ? `${account.substring(0, 4)}...${account.substring(
                account.length - 4,
                account.length
              )}님 환영합니다.`
            : '카이카스 지갑을 연결해주세요.'}
        </Text>
      </Box>
    </Flex>
  );
};

export default Header;
