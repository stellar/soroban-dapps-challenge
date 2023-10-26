import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { oracle } from "@/shared/contracts";
import { EpochData, PairInfo } from "oracle-contract";
import { useEffect, useState } from "react";
import { formatDate, formatShortAddress } from "@/utils/utils.tsx";
import CopyButton from "@/components/CopyButton.tsx";

export const ItemCardContainer = ({
  contract,
  callback,
}: {
  contract: typeof oracle;
  callback?: any;
}) => {
  const [pairInfo, setPairInfo] = useState<(PairInfo & EpochData) | null>(null);
  const [isLoadingPairInfo, setIsLoadingPairInfo] = useState<boolean>(false);

  const getPairInfo = async () => {
    setIsLoadingPairInfo(true);
    try {
      let txPairInfo = await contract.getPairInfo();
      let txPairDataAtEpoch = await contract.getPairDataAtEpoch({
        epoch_nr: txPairInfo?.last_epoch,
      });
      setPairInfo({ ...txPairInfo, ...txPairDataAtEpoch });
      if (callback) callback({ ...txPairInfo, ...txPairDataAtEpoch });
      setIsLoadingPairInfo(false);
    } catch (e) {
      console.log(e);
      setIsLoadingPairInfo(false);
    }
  };

  useEffect(() => {
    if (contract) getPairInfo();
  }, [contract]);

  return (
    <PairCard
      isLoadingPairInfo={isLoadingPairInfo}
      contract={contract}
      pairInfo={pairInfo}
    />
  );
};

export default function PairCard({
  contract,
  callback,
  pairInfo,
  isLoadingPairInfo,
}: {
  isLoadingPairInfo: boolean;
  contract: typeof oracle;
  callback?: any;
  pairInfo: (PairInfo & EpochData) | null;
}) {
  const { pathname } = useLocation();

  if (!isLoadingPairInfo && !pairInfo) return <></>;

  return (
    <Center py={6}>
      <Stack
        borderWidth="1px"
        borderRadius="lg"
        // height={{sm: '250px', md: '350px'}}
        direction={{ base: "column", sm: "row" }}
        bg={useColorModeValue("white", "gray.900")}
        boxShadow={"md"}
        w={"100%"}
        padding={4}
      >
        {isLoadingPairInfo ? (
          <Flex w={"100%"} justify={"center"} align={"center"}>
            <Spinner size="lg" />
          </Flex>
        ) : (
          <>
            <Stack gap={1} align={"center"} justify={"center"} flex={1}>
              <Image
                objectFit="cover"
                height={{ sm: "150px", md: "200px" }}
                src={
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png"
                }
                alt="#"
              />
              <Text fontSize="3xl" fontWeight="bold">
                <Badge fontSize="1em" w={"max-content"} colorScheme={"orange"}>
                  {Number(pairInfo?.value) / 10 ** 5} $
                </Badge>
              </Text>
            </Stack>
            <Stack
              flex={1}
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              p={1}
              pt={2}
            >
              <Heading fontSize={"2xl"} fontFamily={"body"}>
                {pairInfo?.pair_name}
              </Heading>
              <Box
                borderWidth="1px"
                rounded="lg"
                shadow="1px 1px 3px rgba(0,0,0,0.3)"
                maxWidth={800}
                m="10px auto"
                p={3}
              >
                <Flex gap={10} justify={"space-between"}>
                  <Text fontWeight={600} color={"gray.500"} size="sm">
                    Created time:
                  </Text>
                  <Text fontWeight={600} color={"gray.500"} size="sm">
                    {formatDate(
                      new Date(
                        parseInt(pairInfo!.create_time?.toString()) * 1000
                      )
                    )}
                  </Text>
                </Flex>
                <Flex gap={10} justify={"space-between"}>
                  <Text fontWeight={600} color={"gray.500"} size="sm">
                    Updated time:
                  </Text>
                  <Text fontWeight={600} color={"gray.500"} size="sm">
                    {formatDate(
                      new Date(parseInt(pairInfo!.time?.toString()) * 1000)
                    )}
                  </Text>
                </Flex>
                <Flex gap={10} justify={"space-between"}>
                  <Text fontWeight={600} color={"gray.500"} size="sm">
                    Epoch interval:
                  </Text>
                  <Text fontWeight={600} color={"gray.500"} size="sm">
                    {pairInfo!.epoch_interval} sec
                  </Text>
                </Flex>
                <Flex gap={10} justify={"space-between"}>
                  <Text fontWeight={600} color={"gray.500"} size="sm">
                    Last epoch:
                  </Text>
                  <Text fontWeight={600} color={"gray.500"} size="sm">
                    {pairInfo!.last_epoch}
                  </Text>
                </Flex>
              </Box>
              <CopyButton
                str={formatShortAddress(pairInfo!.relayer)}
                value={pairInfo!.relayer}
                size={"md"}
              />
              <Stack
                width={"70%"}
                direction={"row"}
                padding={2}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                {/* {pathname?.includes("home") && (
                  <Button
                    flex={1}
                    fontSize={"sm"}
                    rounded={"full"}
                    bg={"blue.400"}
                    color={"white"}
                    boxShadow={
                      "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
                    }
                    _hover={{
                      bg: "blue.500",
                    }}
                    _focus={{
                      bg: "blue.500",
                    }}
                  >
                    <Link
                      style={{ fontSize: 20, width: "100%" }}
                      to={`/${pairInfo?.pair_name}`}
                    >
                      Details
                    </Link>
                  </Button>
                )} */}
              </Stack>
            </Stack>
          </>
        )}
      </Stack>
    </Center>
  );
}
