import { useAppContext } from "@/context/appContext";

// returning the same object identity every time avoids unnecessary re-renders
const addressObject = {
  address: "",
  displayName: "",
};

const addressToHistoricObject = (address: string) => {
  addressObject.address = address;
  addressObject.displayName = `${address.slice(0, 4)}...${address.slice(-4)}`;
  return addressObject;
};

/**
 * Returns an object containing `address` and `displayName` properties, with the address render-friendly way.
 *
 * Before the address is fetched, returns null.
 */
export function useAccount(): typeof addressObject | null {
  const { walletAddress } = useAppContext();

  if (walletAddress) return addressToHistoricObject(walletAddress);

  return null;
}
