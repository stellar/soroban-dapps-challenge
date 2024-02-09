import { Button, useToast } from "@chakra-ui/react";
import { IconWallet, IconLogout, IconLoader } from "@tabler/icons-react";
import CopyButton from "@/components/CopyButton.tsx";
import { formatShortAddress } from "@/utils/utils.tsx";
import {
  StellarWalletsKit,
  WalletNetwork,
  WalletType,
  ISupportedWallet,
} from "stellar-wallets-kit";
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/appContext";

// Soroban is only supported on Futurenet right now
const FUTURENET_DETAILS = {
  network: "FUTURENET",
  networkUrl: "https://horizon-futurenet.stellar.org",
  networkPassphrase: "Test SDF Future Network ; October 2022",
};

const ERRORS = {
  WALLET_CONNECTION_REJECTED: "Wallet connection rejected",
};

const STORAGE_WALLET_KEY = "wallet";

const allowedWallets = [
  WalletType.FREIGHTER,
  // WalletType.ALBEDO,
  // WalletType.XBULL,
];

export const Wallet = () => {
  const toast = useToast();
  const { walletAddress, setWalletAddress } = useAppContext();

  // Update is not only Futurenet is available
  const [selectedNetwork] = useState(FUTURENET_DETAILS);
  // Setup swc, user will set the desired wallet on connect
  const [SWKKit] = useState(
    new StellarWalletsKit({
      network: selectedNetwork.networkPassphrase as WalletNetwork,
      selectedWallet: WalletType.FREIGHTER,
    })
  );

  const [isLoading, setIsLoading] = useState(false);

  // Whenever the selected network changes, set the network on swc
  useEffect(() => {
    SWKKit.setNetwork(selectedNetwork.networkPassphrase as WalletNetwork);
  }, [selectedNetwork.networkPassphrase, SWKKit]);

  const getWalletAddress = async (type: WalletType) => {
    try {
      setIsLoading(true);
      // Set selected wallet, network, and public key
      SWKKit.setWallet(type);
      const publicKey = await SWKKit.getPublicKey();
      SWKKit.setNetwork(WalletNetwork.FUTURENET);

      // Short timeout to prevent blick on loading address
      setTimeout(() => {
        setWalletAddress(publicKey);
        localStorage.setItem(STORAGE_WALLET_KEY, type);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      localStorage.removeItem(STORAGE_WALLET_KEY);
      setIsLoading(false);
      toast({
        title: ERRORS.WALLET_CONNECTION_REJECTED,
        description: "",
        position: "bottom-right",
        status: "error",
        duration: 3000,
        isClosable: true,
        variant: "subtle",
      });
    }
  };

  useEffect(() => {
    const storedWallet = localStorage.getItem(STORAGE_WALLET_KEY);
    if (
      storedWallet &&
      Object.values(WalletType).includes(storedWallet as WalletType)
    ) {
      (async () => {
        await getWalletAddress(storedWallet as WalletType);
      })();
    }
  }, []);

  const onClick = async () => {
    if (!walletAddress) {
      // See https://github.com/Creit-Tech/Stellar-Wallets-Kit/tree/main for more options
      await SWKKit.openModal({
        allowedWallets,
        onWalletSelected: async (option: ISupportedWallet) => {
          await getWalletAddress(option.type);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <Button
        fontSize={"sm"}
        fontWeight={600}
        color={"white"}
        bg={"gray.700"}
        rightIcon={<IconLoader />}
      >
        Loading
      </Button>
    );
  }

  if (walletAddress) {
    const onDisconnect = () => {
      setWalletAddress("");
      localStorage.removeItem(STORAGE_WALLET_KEY);
    };

    return (
      <>
        <CopyButton
          str={String(formatShortAddress(walletAddress))}
          value={walletAddress}
          size={"xs"}
        />
        <Button
          fontSize={"sm"}
          fontWeight={600}
          color={"white"}
          bg={"gray.400"}
          rightIcon={<IconLogout />}
          onClick={onDisconnect}
          _hover={{ bg: "gray.300" }}
        >
          Disconnect
        </Button>
      </>
    );
  }

  return (
    <Button
      fontSize={"sm"}
      fontWeight={600}
      color={"white"}
      bg={"pink.400"}
      rightIcon={<IconWallet />}
      onClick={onClick}
      _hover={{ bg: "pink.300" }}
    >
      Connect
    </Button>
  );
};
