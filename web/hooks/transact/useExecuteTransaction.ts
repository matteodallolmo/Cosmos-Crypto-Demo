import { useMutation } from "@tanstack/react-query";
import { useChain } from "@cosmos-kit/react";
import { MsgSendEncodeObject } from "@cosmjs/stargate";

interface ExecuteTxParams {
  fromAddress: string;
  toAddress: string;
  amount: string;
  denom: string;
  chainName: string;
}

export const useExecuteTransaction = (chainName: string) => {
  const { getSigningStargateClient, isWalletConnected, address, connect } =
    useChain(chainName);

  return useMutation({
    mutationFn: async ({
      fromAddress,
      toAddress,
      amount,
      denom,
    }: Omit<ExecuteTxParams, "chainName">) => {
      if (!isWalletConnected) {
        await connect();
      }

      const client = await getSigningStargateClient();
      if (!client) {
        throw new Error("Failed to get signing client");
      }

      const msg: MsgSendEncodeObject = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress,
          toAddress,
          amount: [
            {
              denom,
              amount,
            },
          ],
        },
      };

      const fee = {
        amount: [
          {
            denom,
            amount: "500",
          },
        ],
        gas: "200000",
      };

      const result = await client.signAndBroadcast(fromAddress, [msg], fee);
      console.log(result);

      if (result.code !== 0) {
        throw new Error(
          `Transaction failed with code ${result.code}: ${result.rawLog}`
        );
      }

      return {
        transactionHash: result.transactionHash,
        rawLog: result.rawLog,
      };
    },
  });
};
