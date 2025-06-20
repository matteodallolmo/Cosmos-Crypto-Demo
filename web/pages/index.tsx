import Image from "next/image";
import { Box, Text, useColorModeValue } from "@interchain-ui/react";

import { Button } from "@/components";
import { useChainStore } from "@/contexts";
import { useConnectChain, useDetectBreakpoints } from "@/hooks";

export default function Home() {
  const { isMobile } = useDetectBreakpoints();
  const { selectedChain } = useChainStore();
  const { connect, isWalletConnected, openView } =
    useConnectChain(selectedChain);

  const chainsImageSrc = useColorModeValue(
    "/images/chains.png",
    "/images/chains-dark.png"
  );

  return (
    <>
      <Text
        textAlign="center"
        fontSize="48px"
        fontWeight="500"
        attributes={{ mt: "100px", mb: "20px" }}
      >
        WF Digital Currency Demo
      </Text>
      <Text
        textAlign="center"
        fontSize="16px"
        fontWeight="500"
        attributes={{ mb: "20px" }}
      >
        Welcome to <HighlightText>WF Blockchain</HighlightText> +{" "}
        <AccentText>Cosmos Kit</AccentText>
      </Text>
      <Button
        variant="wells"
        leftIcon="walletFilled"
        mx="auto"
        onClick={isWalletConnected ? openView : connect}
      >
        {isWalletConnected ? "My Wallet" : "Connect Wallet"}
      </Button>
      <Box
        display="flex"
        justifyContent="center"
        mt={isMobile ? "60px" : "100px"}
      >
        <Image
          alt="chains"
          src={chainsImageSrc}
          width={840}
          height={224}
          style={{
            maxWidth: "840px",
            width: "100%",
            height: "auto",
          }}
        />
      </Box>
    </>
  );
}

const HighlightText = ({ children }: { children: string }) => {
  return (
    <Text as="span" color="$orange600">
      {children}
    </Text>
  );
};

const AccentText = ({ children }: { children: string }) => {
  return (
    <Text as="span" color="$yellow400">
      {children}
    </Text>
  );
};
