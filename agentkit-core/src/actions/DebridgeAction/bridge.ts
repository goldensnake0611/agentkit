import { z } from "zod";
import { Transaction, ZeroXgaslessSmartAccount } from "@0xgasless/smart-account";
import { AgentkitAction } from "../../agentkit";
import {
  sendTransaction,
  formatTokenAmount,
  checkAndApproveTokenAllowance,
  // We might need resolveTokenSymbol if we add symbol support later
  // resolveTokenSymbol,
} from "../../services";

const BRIDGE_PROMPT = `
This tool allows you to bridge tokens cross-chain using Debridge DLN.

You need to provide:
- Source and destination chain IDs (e.g., 1 for Ethereum, 137 for Polygon)
- Token addresses for the input and output tokens
- The amount of the input token to bridge

USAGE GUIDANCE:
- Specify 'fromChainId', 'toChainId', 'tokenInAddress', 'tokenOutAddress', and 'amount'.
- Optionally, you can provide a 'recipientAddress' for the tokens on the destination chain. If not provided, tokens will be sent to your agent's wallet address.
- Optionally, set a custom 'slippage' (e.g., "0.5" for 0.5%). Default is "1".
- Optionally, set 'approveMax: true' to approve maximum token allowance for the input token. Default is false.

EXAMPLES:
- Bridge 100 USDC from Ethereum (1) to Polygon (137) for DAI: 
  "Bridge 100 USDC (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) on chain 1 to DAI (0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063) on chain 137"
  (Assuming the tool maps this to the correct JSON input with chain IDs and token addresses)

Note: This action works with Debridge DLN supported chains and tokens.
All transactions on the source chain are gasless if using a 0xgasless smart account.
The tool will submit the transaction and wait for confirmation by default.
`;

export const SmartBridgeInput = z
  .object({
    fromChainId: z
      .number()
      .int()
      .positive()
      .describe("The ID of the source chain (e.g., 1 for Ethereum)"),
    toChainId: z
      .number()
      .int()
      .positive()
      .describe("The ID of the destination chain (e.g., 137 for Polygon)"),
    tokenInAddress: z
      .string()
      .startsWith("0x")
      .length(42)
      .describe("The address of the input token on the source chain"),
    tokenOutAddress: z
      .string()
      .startsWith("0x")
      .length(42)
      .describe("The address of the output token on the destination chain"),
    amount: z
      .string()
      .describe("The amount of input token to bridge (human-readable, e.g., '100')"),
    recipientAddress: z
      .string()
      .startsWith("0x")
      .length(42)
      .optional()
      .describe(
        "Optional: The address to receive tokens on the destination chain. Defaults to your wallet address.",
      ),
    slippage: z
      .string()
      .optional()
      .default("1") // Defaulting to 1%
      .describe(
        "Optional: Slippage tolerance in percentage (e.g., '0.5' for 0.5%). Default is '1'.",
      ),
    approveMax: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Optional: Whether to approve maximum token allowance for the input token. Default is false.",
      ),
  })
  .strip()
  .describe("Instructions for bridging tokens cross-chain via Debridge DLN");

export async function smartBridge(
  wallet: ZeroXgaslessSmartAccount,
  args: z.infer<typeof SmartBridgeInput>,
): Promise<string> {
  // Implementation to follow based on the plan
  try {
    const currentChainId = wallet.rpcProvider.chain?.id;
    if (!currentChainId) {
      return "Error: Unable to determine the current chain ID from the wallet.";
    }
    if (currentChainId !== args.fromChainId) {
      return `Error: Wallet is connected to chain ${currentChainId}, but the 'fromChainId' is ${args.fromChainId}. Please ensure the wallet is on the correct source chain.`;
    }

    const senderAddress = await wallet.getAddress();
    const recipient = args.recipientAddress || senderAddress;

    // 1. Format Amount (We'll need token details for this, Debridge might return them or we fetch them)
    // For now, let's assume Debridge API will handle the raw amount if we can't get decimals easily before the first API call.
    // Or, the Debridge create-tx might take unformatted amount and srcChainTokenInDecimals.
    // The existing swap.ts uses formatTokenAmount which requires tokenInAddress and wallet.
    // Let's try to use it.
    let formattedAmount: string;
    try {
      formattedAmount = await formatTokenAmount(
        wallet,
        args.tokenInAddress as `0x${string}`,
        args.amount,
      );
    } catch (error) {
      console.error("Error formatting token amount:", error);
      return `Error: Could not format token amount for ${args.tokenInAddress}. Ensure it's a valid token address and you have balance. Error: ${error instanceof Error ? error.message : String(error)}`;
    }

    // 2. Construct Debridge API URL
    const debridgeApiBaseUrl = "https://dln.debridge.finance/v1.0/dln/order/create-tx";
    const queryParams = new URLSearchParams({
      srcChainId: args.fromChainId.toString(),
      dstChainId: args.toChainId.toString(),
      srcChainTokenIn: args.tokenInAddress,
      srcChainTokenInAmount: formattedAmount, // Using formatted amount
      dstChainTokenOut: args.tokenOutAddress,
      dstChainTokenOutRecipient: recipient,
      slippage: args.slippage,
      senderAddress: senderAddress, // Required by create-tx
      // affiliateFeePercent: "0", // Optional, defaults to 0
    });
    const debridgeApiUrl = `${debridgeApiBaseUrl}?${queryParams.toString()}`;

    // 3. Call Debridge API
    let apiResponseData;
    try {
      const response = await fetch(debridgeApiUrl);
      apiResponseData = await response.json();

      if (!response.ok) {
        console.error("Debridge API Error Response:", apiResponseData);
        const errorDetail =
          apiResponseData.error ||
          apiResponseData.message ||
          JSON.stringify(apiResponseData.details || apiResponseData);
        if (
          typeof errorDetail === "string" &&
          errorDetail.toLowerCase().includes("minimum trade amount is")
        ) {
          return `Error from Debridge API: ${errorDetail}. The amount might be too small.`;
        }
        if (
          typeof errorDetail === "string" &&
          errorDetail.toLowerCase().includes("can not estimate with 0 amount")
        ) {
          return `Error from Debridge API: ${errorDetail}. The input amount seems to be zero after formatting.`;
        }
        return `Error from Debridge API (${response.status}): ${errorDetail}`;
      }

      // Validate that we have tx and estimation data
      if (!apiResponseData.tx || !apiResponseData.estimation) {
        console.error("Debridge API response missing tx or estimation:", apiResponseData);
        return "Error: Debridge API response is incomplete. Missing transaction or estimation data.";
      }
    } catch (error) {
      console.error("Error calling Debridge API:", error);
      return `Error calling Debridge API: ${error instanceof Error ? error.message : String(error)}`;
    }

    const { tx, estimation } = apiResponseData;
    const { recommendedSlippage, srcChainTokenIn, dstChainTokenOut } = estimation;

    // 4. Token Approval (Source Chain)
    // Native currency is usually 0x0 or 0xeeee... Debridge uses the actual token address for native (e.g. WETH)
    // We should always check allowance unless it's the chain's native gas token (which wouldn't be an ERC20 to approve)
    // The `create-tx` endpoint should handle native assets correctly by omitting `data` for simple transfers or wrapping if needed.
    // For ERC20s, `tx.to` will be the DLN contract, and `tx.data` will be the call to transferFrom or similar.
    // We need to approve `tx.to` (DLN contract) to spend `args.tokenInAddress`.
    // The `create-tx` endpoint is for fixed input amount, so `srcChainTokenIn.amount` from estimation should match `formattedAmount`.

    // Only approve if tokenInAddress is not a native-like address (though debridge might wrap it)
    // A robust check is to see if tx.data exists. If it's a simple native send, tx.data might be empty.
    // However, DLN always interacts with its contract, so tx.data should always be present for ERC20s.
    // The safe bet is to check approval for any non-zero tokenInAddress if tx.data is present.
    // Debridge docs imply `srcChainTokenIn` is the actual token being sent. If it's native ETH, it will be tx.value.
    // If it's an ERC20, it will be a contract call.

    // If `tx.value` is present and non-zero, it's likely a native asset transfer (or part of it).
    // If `tx.data` is present, it's a contract interaction.
    // For ERC20s, `tx.value` should be 0 or undefined.
    // We only need to approve if `args.tokenInAddress` is an ERC20.
    // A common way to check if a token is native is if its address is the zero address or a special placeholder.
    // However, Debridge might expect WETH for ETH. Let's assume any token address needs approval step
    // unless it's explicitly known to be the native gas token of the chain AND debridge handles it via msg.value.
    // The `create-tx` gives us `tx.value`. If this is > 0, it's handling native. Otherwise, it's ERC20.

    if (!(tx.value && BigInt(tx.value) > 0)) {
      // If not sending native currency via tx.value
      const spenderAddress = tx.to as `0x${string}`;
      const approvalResult = await checkAndApproveTokenAllowance(
        wallet,
        args.tokenInAddress as `0x${string}`,
        spenderAddress,
        BigInt(formattedAmount), // Amount to approve
        args.approveMax,
      );

      if (!approvalResult.success) {
        return `Failed to approve token spending for ${args.tokenInAddress}: ${approvalResult.error}`;
      }

      if (approvalResult.userOpHash) {
        console.log(
          `Token approval successful for ${args.tokenInAddress}. UserOpHash: ${approvalResult.userOpHash}`,
        );
      }
    }

    // 5. Send Transaction (Source Chain)
    const transactionToSubmit: Transaction = {
      to: tx.to as `0x${string}`,
      data: (tx.data as `0x${string}` | undefined) || "0x", // Default to "0x" if undefined
      value: tx.value ? BigInt(tx.value) : undefined,
    };

    const txResponse = await sendTransaction(wallet, transactionToSubmit);

    if (!txResponse.success) {
      return `Bridge transaction failed: ${
        typeof txResponse.error === "string" ? txResponse.error : JSON.stringify(txResponse.error)
      }`;
    }

    // 6. Return Result
    // Debridge's estimation provides human-readable amounts/symbols.
    const inputAmountHuman = args.amount; // The user's input
    const inputSymbol = srcChainTokenIn.symbol || args.tokenInAddress;
    const outputAmountHuman = dstChainTokenOut.amount; // Expected output from estimation
    const outputSymbol = dstChainTokenOut.symbol || args.tokenOutAddress;

    return `Bridge transaction submitted successfully!
Source Tx Hash: ${txResponse.txHash}
Sending: ${inputAmountHuman} ${inputSymbol} (from chain ${args.fromChainId})
Est. Receiving: ${outputAmountHuman} ${outputSymbol} (on chain ${args.toChainId})
Recipient: ${recipient}
Recommended slippage by Debridge: ${recommendedSlippage || args.slippage}%
Note: Actual received amount may vary. Check the order status via Debridge for updates.`;
  } catch (error) {
    console.error("Smart Bridge Error:", error);
    return `An unexpected error occurred during the bridge operation: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export class SmartBridgeAction implements AgentkitAction<typeof SmartBridgeInput> {
  public name = "smart_bridge";
  public description = BRIDGE_PROMPT;
  public argsSchema = SmartBridgeInput;
  public func = smartBridge;
  public smartAccountRequired = true; // Requires a smart account for gasless and approvals
}
