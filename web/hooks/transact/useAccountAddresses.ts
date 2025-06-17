import { useQuery } from "@tanstack/react-query";
import { useChain } from "@cosmos-kit/react";

export const useAccountAddresses = (chainName: string) => {
  const { chain, getRestEndpoint } = useChain(chainName);

  return useQuery({
    queryKey: ["accountAddresses", chainName],
    queryFn: async () => {
      if (chain.chain_name !== "cca") {
        return { invalidChain: true }; // Return a flag for invalid chain
      }

      const restEndpoint = await getRestEndpoint();
      const response = await fetch(
        `${restEndpoint}/cosmos/auth/v1beta1/accounts`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch account addresses");
      }
      const data = await response.json();
      return {
        invalidChain: false,
        addresses: data.accounts.map((account: any) => account.address),
      };
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
