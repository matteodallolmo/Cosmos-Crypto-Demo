import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Text,
  Spinner,
  Button,
  TextField,
  BasicModal,
  Select,
  SelectOption,
} from "@interchain-ui/react";
import {
  useAccountAddresses,
  useAccountBalance,
  useExecuteTransaction,
} from "@/hooks/transact";
import { useChainStore } from "@/contexts";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

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

  const handleExecute = () => {
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
          refetchBalance();
          queryClient.invalidateQueries(["account-balance", to, selectedChain]);
        },
      }
    );
  };

  const handleSelect = (address: string) => {
    setSelectedAddress(address);
    refetchBalance();
  };

  return (
    <Box p="32px" maxWidth="800px" margin="0 auto">
      <Text fontSize="28px" fontWeight="bold" mb="24px">
        Accounts
      </Text>

      {/* Scrollable List of Accounts */}
      <Box
        maxHeight="40vh"
        overflowY="auto"
        border="1px solid var(--ic-gray-200)"
        borderRadius="8px"
        mb="32px"
      >
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <Text color="red600">{error.message}</Text>
        ) : (
          data?.addresses
            ?.filter((address: string | undefined) => address !== undefined)
            .map((addr) => (
              <Box
                key={addr}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p="12px 16px"
                borderBottom="1px solid var(--ic-gray-200)"
              >
                <Text fontSize="14px">
                  <strong>Address:</strong> {addr}
                </Text>
                <Button onClick={() => handleSelect(addr)}>Show Balance</Button>
              </Box>
            ))
        )}
      </Box>

      {/* Balance Display */}
      {selectedAddress && (
        <Box
          mb="32px"
          p="16px"
          border="1px solid var(--ic-gray-200)"
          borderRadius="8px"
        >
          <Text fontWeight="bold" fontSize="16px">
            Balance for {selectedAddress}
          </Text>
          {isLoadingBalance ? (
            <Spinner />
          ) : balance ? (
            balance.map((b: any) => (
              <Text key={b.denom} fontSize="16px">
                {b.amount} {b.denom}
              </Text>
            ))
          ) : (
            <Text color="red600">Unable to fetch balance.</Text>
          )}
        </Box>
      )}

      {/* Transaction Form */}
      <Box
        p="24px"
        border="1px solid var(--ic-gray-200)"
        borderRadius="8px"
        textAlign="center"
      >
        <Text fontSize="20px" fontWeight="bold" mb="16px">
          Send Tokens
        </Text>
        <Box
          display="flex"
          flexDirection="column"
          gap="16px"
          alignItems="stretch"
        >
          <TextField
            label="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <TextField
            label="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Box display="flex" gap="16px">
            <TextField
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              flex="1"
            />
            <Select
              width={150}
              label="Denomination"
              value={denom}
              onChange={(e) => setDenom(e.target.value)}
            >
              <SelectOption label="token">Token</SelectOption>
              <SelectOption label="stake">Stake</SelectOption>
            </Select>
          </Box>
          <Button
            onClick={handleExecute}
            disabled={!from || !to || !amount || !denom}
          >
            Execute Transaction
          </Button>

          {isError && (
            <Box mt="12px" p="12px" bg="$red600" borderRadius="8px">
              <Text>Error: {txError.message}</Text>
            </Box>
          )}
          {isSuccess && (
            <Box mt="12px" p="12px" bg="$green600" borderRadius="8px">
              <Text>
                Transaction successful! Hash: {txData.transactionHash}
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      {showPopup && (
        <BasicModal
          isOpen={showPopup}
          onClose={handleRedirect}
          title="Invalid Chain Selected"
        >
          <Box
            display="flex"
            flexDirection="column"
            gap="16px"
            p="24px"
            textAlign="center"
          >
            <Text fontSize="16px" color="$whiteAlpha800">
              Please select the "cca" chain to view account addresses.
            </Text>
            <Button onClick={handleRedirect}>Go to Home Page</Button>
          </Box>
        </BasicModal>
      )}
    </Box>
  );
}
