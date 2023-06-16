import { providers, Wallet } from "ethers";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";

const CHAIN_ID = 5;
const provider = providers.getDefaultProvider('goerli')

const FLASHBOTS_ENDPOINT = "https://relay-goerli.flashbots.net";

if (process.env.WALLET_PRIVATE_KEY === undefined) {
  console.error("Please provide WALLET_PRIVATE_KEY env")
  process.exit(1)
}
const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY, provider)

// ethers.js can use Bignumber.js class OR the JavaScript-native bigint. I changed this to bigint as it is MUCH easier to deal with
const GWEI = 10n ** 9n
const ETHER = 10n ** 18n

async function main() {
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    Wallet.createRandom(),
    FLASHBOTS_ENDPOINT, 'goerli'
  )
  const signedTransactions = await flashbotsProvider.signBundle([
    {
      transaction: {
        chainId: CHAIN_ID,
        type: 2,
        value: ETHER / 100n * 3n,
        data: "0x1249c58b",
        maxFeePerGas: GWEI * 5n,
        maxPriorityFeePerGas: GWEI * 5n,
        to: "0x20EE855E43A7af19E407E39E5110c2C1Ee41F64D"
      },
      signer: wallet
    }
  ])
  const blockNumber = await provider.getBlockNumber();

  for (var i = 1; i <= 10; i++) {
    const bundleSubmitResponse = await flashbotsProvider.sendRawBundle(
      signedTransactions, blockNumber + i
    )
    console.log("submitted for block # ", blockNumber + i);
  }
  console.log("bundles submitted");
}


main();