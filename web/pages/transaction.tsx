import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Text,
  Spinner,
  TextField,
  BasicModal,
  Select,
  SelectOption,
  Divider,
} from "@interchain-ui/react";
import { Button } from "@/components";
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
    <Box display="flex" flexDirection="column" height="100%" px="32px">
      <Box flexShrink="0" display="flex" textAlign="center" mb="16px">
        <Text fontSize="28px" fontWeight="bold" mb="24px">
          Accounts
        </Text>
      </Box>

      <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
        {/* Scrollable List of Accounts */}
        <Box
          flex="1"
          overflowY="auto"
          border="1px solid var(--ic-gray-200)"
          borderRadius="8px"
          mb="8px"
          px="24px"
          py="12px"
          maxHeight="300px"
          minHeight="300px"
        >
          {isLoading ? (
            <Spinner />
          ) : error ? (
            <Text color="red600">{error.message}</Text>
          ) : (
            data?.addresses
              ?.filter((address: string | undefined) => address !== undefined)
              .map((addr, index, array) => (
                <Box key={addr}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py="12px"
                  >
                    <Box>
                      <Text
                        fontSize="14px"
                        fontWeight="600"
                        color="$blackAlpha800"
                      >
                        Address
                      </Text>
                      <Text fontSize="14px">{addr}</Text>
                    </Box>
                    <Button variant="wells" onClick={() => handleSelect(addr)}>
                      Show Balance
                    </Button>
                  </Box>
                  {index !== array.length - 1 && <Divider />}
                </Box>
              ))
          )}
        </Box>

        <Box flexShrink="0">
          {/* Balance Display */}
          <Box
            mb="0px"
            p="16px"
            border="1px solid var(--ic-gray-200)"
            borderRadius="8px"
            minHeight="100px"
          >
            <Text fontWeight="bold" fontSize="16px" mb="12px">
              {selectedAddress
                ? `Balance for ${selectedAddress}`
                : "Select an address to view its balance"}
            </Text>

            {selectedAddress ? (
              isLoadingBalance ? (
                <Spinner />
              ) : balance && balance.length > 0 ? (
                balance.map((b: any, index: number) => (
                  <Box key={b.denom}>
                    <Box py="8px" display="flex" justifyContent="space-between">
                      <Text
                        fontSize="14px"
                        color="$blackAlpha800"
                        fontWeight="500"
                      >
                        {b.denom.toUpperCase()}
                      </Text>
                      <Text fontSize="14px">{b.amount}</Text>
                    </Box>
                    {index !== balance.length - 1 && <Divider />}
                  </Box>
                ))
              ) : (
                <Text color="$red600">Unable to fetch balance.</Text>
              )
            ) : (
              <Text fontSize="14px" color="$gray500">
                No address selected.
              </Text>
            )}
          </Box>

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
                variant="wells"
                width={300}
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
            <Text fontSize="16px" color="$blackAlpha800">
              Please select the "cca" chain to view account addresses.
            </Text>
            <Button
              backgroundColor="#dd1f24"
              color="#ffffff"
              onClick={handleRedirect}
            >
              Go to Home Page
            </Button>
          </Box>
        </BasicModal>
      )}
    </Box>
  );
}
