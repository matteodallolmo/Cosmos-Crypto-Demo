import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Text, Spinner, Modal, Button, Stack } from "@interchain-ui/react";
import { useAccountAddresses } from "@/hooks/common";
import { useChainStore } from "@/contexts";

export default function TransactionPage() {
  const { selectedChain } = useChainStore();
  const { data, isLoading, error } = useAccountAddresses(selectedChain);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (data?.invalidChain) {
      setShowPopup(true);
    }
  }, [data]);

  const handleRedirect = () => {
    setShowPopup(false);
    router.push("/");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      flexDirection="column"
    >
      <Text fontSize="24px" fontWeight="bold">
        Transaction Page
      </Text>
      <Text fontSize="16px" color="$blackAlpha600" mb="20px">
        List of Account Addresses:
      </Text>
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <Text color="$red600">{error.message}</Text>
      ) : data?.invalidChain ? null : (
        <Box>
          {data?.addresses?.map((address: string, index: number) => (
            <Text key={index} fontSize="14px" color="$blackAlpha800">
              {address}
            </Text>
          ))}
        </Box>
      )}

      {showPopup && (
        <Modal
          isOpen={showPopup}
          onClose={handleRedirect}
          title="Invalid Chain Selected"
        >
          <Stack
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            direction="column"
            p="20px"
          >
            <Text fontSize="16px" color="$blackAlpha800">
              Please select the "cca" chain to view account addresses.
            </Text>
            <Button variant="primary" onClick={handleRedirect}>
              Go to Home Page
            </Button>
          </Stack>
        </Modal>
      )}
    </Box>
  );
}
