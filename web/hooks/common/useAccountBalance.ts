import { useQuery } from "@tanstack/react-query";
import { useChain } from "@cosmos-kit/react";

export const useAccountBalance = (address: string, chainName: string) => {
  const { getRestEndpoint } = useChain(chainName);

  return useQuery({
    queryKey: ["accountBalance", address],
    queryFn: async () => {
      const restEndpoint = await getRestEndpoint();
      const response = await fetch(
        `${restEndpoint}/cosmos/bank/v1beta1/balances/${address}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch account balances");
      }
      const data = await response.json();
      return data.balances;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
