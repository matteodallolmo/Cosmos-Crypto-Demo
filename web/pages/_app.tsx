import "../styles/globals.css";
import "@interchain-ui/react/styles";

import type { AppProps } from "next/app";
import { ChainProvider } from "@cosmos-kit/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from "react";

import { Box, Toaster, useTheme } from "@interchain-ui/react";
import { chains, assets } from "chain-registry";

import { CustomThemeProvider, Layout } from "@/components";
import { wallets } from "@/config";
import { getSignerOptions } from "@/utils";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const { themeClass } = useTheme();
  useEffect(() => {
    const suggestChain = async () => {
      console.log("🔍 Attempting to suggest chain to Keplr...");

      if (
        !window.keplr ||
        !window.getOfflineSigner ||
        !window.keplr.experimentalSuggestChain
      ) {
        console.warn("🚫 Keplr extension not available or incompatible.");
        return;
      }

      try {
        console.log("✅ Keplr detected. Suggesting custom chain...");

        await window.keplr.experimentalSuggestChain({
          chainId: "cca",
          chainName: "WFDC Local Chain",
          rpc: "http://localhost:26657",
          rest: "http://localhost:1317",
          bip44: { coinType: 118 },
          bech32Config: {
            bech32PrefixAccAddr: "wfdc",
            bech32PrefixAccPub: "wfdcpub",
            bech32PrefixValAddr: "wfdcvaloper",
            bech32PrefixValPub: "wfdcvaloperpub",
            bech32PrefixConsAddr: "wfdcvalcons",
            bech32PrefixConsPub: "wfdcvalconspub",
          },
          currencies: [
            {
              coinDenom: "STAKE",
              coinMinimalDenom: "stake",
              coinDecimals: 6,
              coinGeckoId: "",
            },
          ],
          feeCurrencies: [
            {
              coinDenom: "STAKE",
              coinMinimalDenom: "stake",
              coinDecimals: 6,
              coinGeckoId: "",
            },
          ],
          stakeCurrency: {
            coinDenom: "STAKE",
            coinMinimalDenom: "stake",
            coinDecimals: 6,
            coinGeckoId: "",
          },
          features: ["stargate", "ibc-transfer"],
        });

        console.log("✅ Chain suggested successfully.");

        console.log("🔐 Enabling chain in Keplr...");
        await window.keplr.enable("cca");
        console.log("✅ Chain enabled successfully.");

        console.log("🧾 Fetching key info...");
        const key = await window.keplr.getKey("cca");
        console.log("📬 Keplr returned key:", key);

        console.log(`✅ Bech32 Address: ${key.bech32Address}`);
        console.log(`🔐 Public Key:`, key.pubKey);
        console.log(`🆔 Name: ${key.name}`);

        if (!key.bech32Address.startsWith("wfdc")) {
          console.warn("🚨 Unexpected address prefix!", key.bech32Address);
        } else {
          console.log("🎉 Success: Keplr returned correct wfdc address!");
        }
      } catch (err) {
        console.error("❌ Failed to suggest or enable chain:", err);
      }
    };

    suggestChain();
  }, []);

  return (
    <CustomThemeProvider>
      <ChainProvider
        chains={chains}
        // @ts-ignore
        assetLists={assets}
        wallets={wallets}
        walletConnectOptions={{
          signClient: {
            projectId: "a8510432ebb71e6948cfd6cde54b70f7",
            relayUrl: "wss://relay.walletconnect.org",
            metadata: {
              name: "Wells Fargo Cosmos Demo",
              description: "CosmosKit dapp template",
              url: "https://docs.cosmology.zone/cosmos-kit/",
              icons: [],
            },
          },
        }}
        signerOptions={getSignerOptions()}
        endpointOptions={{
          endpoints: {
            mychain: {
              rpc: ["http://localhost:26657"],
            },
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <Box className={themeClass}>
            <Layout>
              {/* @ts-ignore */}
              <Component {...pageProps} />
              <Toaster position="top-right" closeButton={true} />
            </Layout>
          </Box>
          {/* <ReactQueryDevtools /> */}
        </QueryClientProvider>
      </ChainProvider>
    </CustomThemeProvider>
  );
}

export default CreateCosmosApp;
