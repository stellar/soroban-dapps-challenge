import { oracle } from "@/shared/contracts";
import { Stack } from "@chakra-ui/react";
import { ItemCardContainer } from "@/components/Pairs/PairCard.tsx";

export const PairsList = () => {
  return (
    <Stack>
      <ItemCardContainer contract={oracle} />
    </Stack>
  );
};
