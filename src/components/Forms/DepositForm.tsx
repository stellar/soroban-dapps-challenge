import React, { useState } from "react";
import { donation } from "@/shared/contracts";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useAccount } from "@/hooks";
import { useForm } from "react-hook-form";
import { EpochData, PairInfo } from "oracle-contract";

const DepositForm = ({
  submitFormCallback,
  pairInfo,
  recipient,
  myBalance,
}: {
  submitFormCallback: any;
  recipient: any;
  myBalance: any;
  pairInfo: (PairInfo & EpochData) | null;
}) => {
  const toast = useToast();
  const account = useAccount();
  const [isLoadingDeposit, setIsLoadingDeposit] = useState(false);
  const [calculateValue, setCalculateValue] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const {
    reset,
    handleSubmit,
    getValues,
    register,
    formState: { errors },
  } = useForm<{
    amount: string;
  }>({
    defaultValues: {
      amount: "",
    },
    mode: "all",
  });

  const onSubmitDeposit = async (formData: {
    amount: string;
  }): Promise<void> => {
    if (account) {
      if (myBalance >= Number(calculateValue)) {
        setIsLoadingDeposit(true);
        try {
          let txDeposit = await donation.deposit(
            {
              amount: BigInt(Number(calculateValue) * 10 ** 10),
              user: account!.address,
            },
            { fee: 100, secondsToWait: 20, responseType: "full" }
          );
          toast({
            title: "Deposit Successfully!",
            description: "",
            position: "bottom-right",
            status: "success",
            duration: 3000,
            isClosable: true,
            variant: "subtle",
          });

          if (submitFormCallback) {
            setTimeout(() => {
              submitFormCallback();
            }, 1000);
          }

          reset({ amount: "" });
          setIsLoadingDeposit(false);
        } catch (e) {
          console.log(e);
          reset({ amount: "" });
          setIsLoadingDeposit(false);
          toast({
            title: "Deposit Error!",
            description: "",
            position: "bottom-right",
            status: "error",
            duration: 3000,
            isClosable: true,
            variant: "subtle",
          });
        }
      } else {
        toast({
          title: "You don't have enough BTC token!",
          description: "",
          position: "bottom-right",
          status: "error",
          duration: 3000,
          isClosable: true,
          variant: "subtle",
        });
      }
    } else {
      toast({
        title: "Connect wallet!",
        description: "",
        position: "bottom-right",
        status: "error",
        duration: 3000,
        isClosable: true,
        variant: "subtle",
      });
    }
  };

  const handlerCalculateValue = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCalculating(true);
    if (pairInfo && getValues) {
      setCalculateValue(
        // @ts-ignore
        Number(
          Number(getValues()!.amount) / (Number(pairInfo!.value) / 10 ** 5)
        ).toFixed(10)
      );
    }
  };

  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      boxShadow={"md"}
      borderWidth="3px"
      rounded="lg"
      p={6}
    >
      <>
        <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
          Donate
        </Heading>
        <Stack>
          {account?.address !== recipient ? (
            <form onSubmit={handleSubmit(onSubmitDeposit)}>
              <Flex gap={3} align={"flex-start"}>
                <FormControl isInvalid={!!errors.amount} id="bio" mt={1}>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="md"
                    color="gray.700"
                    _dark={{ color: "gray.50" }}
                  >
                    Amount in USD
                  </FormLabel>

                  <NumberInput>
                    <NumberInputField
                      shadow="sm"
                      disabled={isLoadingDeposit}
                      fontSize={{ sm: "sm" }}
                      {...register("amount", {
                        required: "This field is required",
                        min: {
                          value: 0.000000001,
                          message: "Enter a value greater than 0!",
                        },
                      })}
                      onChange={(e) => {
                        setIsCalculating(false);
                        register("amount", {
                          required: "This field is required",
                          min: {
                            value: 0.000000001,
                            message: "Enter a value greater than 0!",
                          },
                        }).onChange(e);
                      }}
                      placeholder="Amount"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>

                  <FormErrorMessage>
                    {errors.amount && errors.amount.message}
                  </FormErrorMessage>
                </FormControl>

                {isCalculating ? (
                  <Button
                    style={{ marginTop: 32 }}
                    isLoading={isLoadingDeposit}
                    type="submit"
                    w="7rem"
                    colorScheme="blue"
                    isDisabled={!isCalculating}
                  >
                    Deposit
                  </Button>
                ) : (
                  <Button
                    style={{ marginTop: 32 }}
                    isLoading={isLoadingDeposit}
                    type="button"
                    w="7rem"
                    variant={"outline"}
                    colorScheme="blue"
                    onClick={handlerCalculateValue}
                  >
                    Calculate
                  </Button>
                )}
              </Flex>
              {isCalculating && (
                <Flex
                  w={"100%"}
                  style={{ marginTop: 10 }}
                  align={"center"}
                  justify={"space-between"}
                >
                  <Box
                    w={"100%"}
                    bg={useColorModeValue("white", "gray.800")}
                    boxShadow={"md"}
                    borderWidth="1px"
                    rounded="lg"
                    p={3}
                  >
                    <Stat>
                      <StatLabel>Pay in BTC:</StatLabel>
                      <StatNumber>
                        <Text>{calculateValue} BTC</Text>
                      </StatNumber>
                      <StatHelpText>
                        1 BTC = {Number(pairInfo?.value) / 10 ** 5} $
                      </StatHelpText>
                    </Stat>
                  </Box>
                </Flex>
              )}
            </form>
          ) : (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>
                You cannot donate because you are the receiver
              </AlertTitle>
            </Alert>
          )}
        </Stack>
      </>
    </Box>
  );
};

export default DepositForm;
