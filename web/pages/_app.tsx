import "../styles/globals.css";
import "@interchain-ui/react/styles";

import type { AppProps } from "next/app";
import { ChainProvider } from "@cosmos-kit/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Box, Toaster, useTheme } from "@interchain-ui/react";
import { chains, assets } from "chain-registry";
import { useEffect } from "react";
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
  const { themeClass, setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
    setTheme("light");
  }, []);

  return (
    <CustomThemeProvider customTheme={"light"}>
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
