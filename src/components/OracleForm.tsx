import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useAccount } from "@/hooks";
import { oracle } from "@/shared/contracts";
import { PairInfo } from "oracle-contract";

type FormTypes = { relayer: string; time: string };

const OracleAddress = ({ pairInfo }: { pairInfo: PairInfo | null }) => {
  const toast = useToast();
  const account = useAccount();

  const [isLoadingSetRelayer, setIsLoadingSetRelayer] = useState(false);

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormTypes>({
    defaultValues: {
      relayer: "",
    },
  });

  useEffect(() => {
    if (pairInfo) {
      reset({ time: pairInfo?.relayer?.toString() });
    }
  }, [pairInfo]);

  const onSubmitRelayer = async (formData: FormTypes): Promise<void> => {
    if (account) {
      setIsLoadingSetRelayer(true);
      try {
        let txPairEpochInterval = await oracle.updateRelayerAddress(
          {
            caller: account!.address,
            new_relayer_address: formData?.relayer,
          },
          { fee: 1000, secondsToWait: 20, responseType: "full" }
        );

        toast({
          title: "Update Relayer Successfully!",
          description: "",
          position: "bottom-right",
          status: "success",
          duration: 3000,
          isClosable: true,
          variant: "subtle",
        });

        setIsLoadingSetRelayer(false);
      } catch (e) {
        console.log(e);
        reset({ time: "0" });
        setIsLoadingSetRelayer(false);
        toast({
          title: "Update Relayer Error!",
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

  return (
    <form onSubmit={handleSubmit(onSubmitRelayer)}>
      <Flex gap={3} align={"flex-start"}>
        <FormControl isInvalid={!!errors.relayer}>
          <FormLabel
            fontSize="sm"
            fontWeight="md"
            color="gray.700"
            _dark={{ color: "gray.50" }}
          >
            Change relayer address
          </FormLabel>
          <Input
            disabled={isLoadingSetRelayer}
            id="name"
            placeholder="New relayer address"
            {...register("relayer", {
              required: "This field is required",
              minLength: { value: 1, message: "Minimum length should be 1" },
            })}
          />
          <FormErrorMessage>
            {errors.relayer && errors.relayer.message}
          </FormErrorMessage>
        </FormControl>
        <Button
          isLoading={isLoadingSetRelayer}
          style={{ marginTop: 32 }}
          type="submit"
          w="7rem"
          colorScheme="blue"
        >
          Save
        </Button>
      </Flex>
    </form>
  );
};

const OracleEpochInterval = ({ pairInfo }: { pairInfo: PairInfo | null }) => {
  const toast = useToast();
  const account = useAccount();

  const [isLoadingSetEpochData, setIsLoadingSetEpochData] = useState(false);

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormTypes>({
    defaultValues: {
      time: "0",
    },
  });

  useEffect(() => {
    if (pairInfo) {
      reset({ time: pairInfo?.epoch_interval?.toString() });
    }
  }, [pairInfo]);

  const onSubmitEpochData = async (formData: FormTypes): Promise<void> => {
    setIsLoadingSetEpochData(true);
    try {
      let txPairEpochInterval = await oracle.updatePairEpochInterval(
        {
          caller: account!.address,
          epoch_interval: Number(formData!.time),
        },
        { fee: 1000, secondsToWait: 20, responseType: "full" }
      );

      toast({
        title: "Update Epoch Data Successfully!",
        description: "",
        position: "bottom-right",
        status: "success",
        duration: 3000,
        isClosable: true,
        variant: "subtle",
      });

      setIsLoadingSetEpochData(false);
    } catch (e) {
      console.log(e);
      reset({ time: "0" });
      setIsLoadingSetEpochData(false);
      toast({
        title: "Update Epoch Data Error!",
        description: "",
        position: "bottom-right",
        status: "error",
        duration: 3000,
        isClosable: true,
        variant: "subtle",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitEpochData)}>
      <Flex gap={3} align={"flex-start"}>
        <FormControl isInvalid={!!errors.time} id="bio" mt={1}>
          <FormLabel
            fontSize="sm"
            fontWeight="md"
            color="gray.700"
            _dark={{ color: "gray.50" }}
          >
            Change epoch interval (sec)
          </FormLabel>

          <NumberInput min={300}>
            <NumberInputField
              shadow="sm"
              disabled={isLoadingSetEpochData}
              fontSize={{ sm: "sm" }}
              placeholder="Seconds"
              {...register("time", {
                required: "This field is required",
                min: { value: 300, message: "Minimum 300 sec" },
              })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>

          <FormErrorMessage>
            {errors.time && errors.time.message}
          </FormErrorMessage>
        </FormControl>

        <Button
          isLoading={isLoadingSetEpochData}
          type="submit"
          w="7rem"
          colorScheme="blue"
          style={{ marginTop: 32 }}
        >
          Save
        </Button>
      </Flex>
    </form>
  );
};

const OracleForm = ({ pairInfo }: { pairInfo: PairInfo | null }) => {
  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      boxShadow={"md"}
      borderWidth="1px"
      rounded="lg"
      p={6}
      mb={20}
    >
      <>
        <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
          Oracle config
        </Heading>
        <Stack>
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            rounded="lg"
            p={3}
            w={"100%"}
            m="10px auto"
          >
            <OracleAddress pairInfo={pairInfo} />
          </Box>
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            rounded="lg"
            p={3}
            w={"100%"}
            m="10px auto"
          >
            <OracleEpochInterval pairInfo={pairInfo} />
          </Box>
        </Stack>
      </>
    </Box>
  );
};

export default OracleForm;
