import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Text,
  Spinner,
  BasicModal,
  Button,
  Stack,
  TextField,
} from "@interchain-ui/react";
import {
  useAccountAddresses,
  useAccountBalance,
  useExecuteTransaction,
} from "@/hooks/transact";
import { useChainStore } from "@/contexts";

export default function TransactionPage() {
  const { selectedChain } = useChainStore();
  const { data, isLoading, error } = useAccountAddresses(selectedChain);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const {
    data: balance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useAccountBalance(selectedAddress || "", selectedChain);

  //transaction data
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [denom, setDenom] = useState("token");

  const {
    mutate,
    isError,
    isSuccess,
    error: txError,
    data: txData,
  } = useExecuteTransaction(selectedChain);

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

  const handleSubmit = () => {
    if (!from || !to || !amount || !denom) return;

    mutate(
      {
        fromAddress: from,
        toAddress: to,
        amount,
        denom,
        chainName: selectedChain,
      },
      {
        onSuccess: () => {
          handleQueryBalance(from);
          handleQueryBalance(to);
        },
      }
    );
  };

  const handleQueryBalance = (address: string) => {
    setSelectedAddress(address);
    refetchBalance();
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
                  onClick={() => handleQueryBalance(address)}
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

      <Box mt="40px" width="400px">
        <Text fontWeight="bold" mb="10px">
          Send Tokens
        </Text>
        <TextField
          id="sender"
          placeholder="Sender Address"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <TextField
          id="receiver"
          placeholder="Recipient Address"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          mt="10px"
        />
        <TextField
          id="amount"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          mt="10px"
        />
        <TextField
          id="denom"
          placeholder="Denomination"
          value={denom}
          onChange={(e) => setDenom(e.target.value)}
          mt="10px"
        />

        <Button
          mt="20px"
          onClick={handleSubmit}
          disabled={!from || !to || !amount || !denom}
        >
          {"Execute Transaction"}
        </Button>

        {isError && (
          <Text color="$red600" mt="10px">
            Error: {txError.message}
          </Text>
        )}
        {isSuccess && (
          <Text color="$green600" mt="10px">
            Tx Success! Hash: {txData.transactionHash}
          </Text>
        )}
      </Box>

      {showPopup && (
        <BasicModal
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
        </BasicModal>
      )}
    </Box>
  );
}
