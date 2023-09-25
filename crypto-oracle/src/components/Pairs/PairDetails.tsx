import { Stack } from "@chakra-ui/react";
import PairCard, { ItemCardContainer } from "./PairCard.tsx";
import * as contractOracleBtc from "oracle-contract";
import OracleForm from "@/components/OracleForm.tsx";
import { useEffect, useState } from "react";
import { useAccount } from "@/hooks";
import { EpochData, PairInfo } from "oracle-contract";

const PairDetails = ({ contract }: { contract: typeof contractOracleBtc }) => {
  const account = useAccount();
  const [pairInfo, setPairInfo] = useState<(PairInfo & EpochData) | null>(null);
  const [isLoadingContractOwner, setIsLoadingContractOwner] =
    useState<boolean>(false);
  const [isContractOwner, setIsContractOwner] = useState(false);
  const [isLoadingPairInfo, setIsLoadingPairInfo] = useState<boolean>(false);

  const getPairInfo = async () => {
    setIsLoadingPairInfo(true);
    try {
      let txPairInfo = await contract.getPairInfo();
      let txPairDataAtEpoch = await contract.getPairDataAtEpoch({
        epoch_nr: txPairInfo?.last_epoch,
      });
      setPairInfo({ ...txPairInfo, ...txPairDataAtEpoch });
      setIsLoadingPairInfo(false);
    } catch (e) {
      console.log(e);
      setIsLoadingPairInfo(false);
    }
  };

  useEffect(() => {
    if (contract) {
      getPairInfo();
      getPairInfo();
    }
  }, [contract]);

  const getIsContractOwner = async () => {
    setIsLoadingContractOwner(true);
    try {
      let txContractOwner = await contract.getContractOwner();
      if (txContractOwner === account?.address) {
        setIsContractOwner(true);
      }
      setIsLoadingContractOwner(false);
    } catch (e) {
      console.log(e);
      setIsLoadingContractOwner(false);
    }
  };

  useEffect(() => {
    if (contract && account) getIsContractOwner();
  }, [contract, account]);

  return (
    <Stack>
      <PairCard
        pairInfo={pairInfo}
        isLoadingPairInfo={isLoadingPairInfo}
        callback={setPairInfo}
        contract={contract}
      />
      {isContractOwner && <OracleForm pairInfo={pairInfo} />}
    </Stack>
  );
};

export default PairDetails;
