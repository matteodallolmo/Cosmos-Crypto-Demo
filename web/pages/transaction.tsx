import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Text, Spinner, Modal, Button, Stack } from "@interchain-ui/react";
import { useAccountAddresses, useAccountBalance } from "@/hooks/common";
import { useChainStore } from "@/contexts";

export default function TransactionPage() {
  const { selectedChain } = useChainStore();
  const { data, isLoading, error } = useAccountAddresses(selectedChain);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const { data: balance, isLoading: isLoadingBalance } = useAccountBalance(
    selectedAddress || "",
    selectedChain
  );
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
          {data?.addresses
            ?.filter((address: string | undefined) => address !== undefined) // Filter out undefined addresses
            .map((address: string, index: number) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap="10px"
                mb="10px"
              >
                <Text fontSize="14px" color="$blackAlpha800">
                  {address}
                </Text>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedAddress(address)}
                >
                  Query Balance
                </Button>
              </Box>
            ))}
        </Box>
      )}

      {selectedAddress && (
        <Box mt="20px">
          <Text fontSize="16px" fontWeight="bold">
            Balance for {selectedAddress}:
          </Text>
          {isLoadingBalance ? (
            <Spinner />
          ) : balance ? (
            <Box>
              {balance.map((bal: any, index: number) => (
                <Text key={index} fontSize="14px" color="$blackAlpha800">
                  {bal.amount} {bal.denom}
                </Text>
              ))}
            </Box>
          ) : (
            <Text fontSize="14px" color="$red600">
              Failed to fetch balance.
            </Text>
          )}
        </Box>
      )}

      {showPopup && (
        <Modal
          isOpen={showPopup}
          onClose={handleRedirect}
          title="Invalid Chain Selected"
        >
          <Stack
            spacing="20px"
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
