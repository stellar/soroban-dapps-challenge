import * as contractOracleBtc from "oracle-contract";
import { Stack } from "@chakra-ui/react";
import { ItemCardContainer } from "@/components/Pairs/PairCard.tsx";

export const PairsList = () => {
  return (
    <Stack>
      <ItemCardContainer contract={contractOracleBtc} />
    </Stack>
  );
};
