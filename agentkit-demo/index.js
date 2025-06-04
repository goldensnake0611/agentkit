"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var agentkit_1 = require("@0xgasless/agentkit");
// import { Agentkit, AgentkitToolkit } from "@0xgas/agentkit";
var messages_1 = require("@langchain/core/messages");
var langgraph_1 = require("@langchain/langgraph");
var prebuilt_1 = require("@langchain/langgraph/prebuilt");
var openai_1 = require("@langchain/openai");
var dotenv = require("dotenv");
var readline = require("readline");
dotenv.config();
function validateEnvironment() {
    var missingVars = [];
    var requiredVars = ["OPENROUTER_API_KEY", "PRIVATE_KEY", "RPC_URL", "API_KEY", "CHAIN_ID"];
    requiredVars.forEach(function (varName) {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });
    if (missingVars.length > 0) {
        console.error("Error: Required environment variables are not set");
        missingVars.forEach(function (varName) {
            console.error("".concat(varName, "=your_").concat(varName.toLowerCase(), "_here"));
        });
        process.exit(1);
    }
    if (!process.env.CHAIN_ID) {
        console.warn("Warning: CHAIN_ID not set, defaulting to base-sepolia");
    }
}
validateEnvironment();
function initializeAgent() {
    return __awaiter(this, void 0, void 0, function () {
        var llm, agentkit, agentkitToolkit, tools, memory, agentConfig, agent, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    llm = new openai_1.ChatOpenAI({
                        model: "gpt-4o",
                        openAIApiKey: process.env.OPENROUTER_API_KEY,
                        configuration: {
                            baseURL: "https://openrouter.ai/api/v1",
                        },
                    });
                    return [4 /*yield*/, agentkit_1.Agentkit.configureWithWallet({
                            privateKey: process.env.PRIVATE_KEY,
                            rpcUrl: process.env.RPC_URL,
                            apiKey: process.env.API_KEY,
                            chainID: Number(process.env.CHAIN_ID) || 8453, // Base Sepolia
                        })];
                case 1:
                    agentkit = _a.sent();
                    agentkitToolkit = new agentkit_1.AgentkitToolkit(agentkit);
                    tools = agentkitToolkit.getTools();
                    memory = new langgraph_1.MemorySaver();
                    agentConfig = { configurable: { thread_id: "0xGasless AgentKit Chatbot Example!" } };
                    agent = (0, prebuilt_1.createReactAgent)({
                        llm: llm,
                        tools: tools,
                        checkpointSaver: memory,
                        messageModifier: "\n        You are a helpful agent that can interact with EVM chains using 0xGasless smart accounts. You can perform \n        gasless transactions using the account abstraction wallet. \n        \n        IMPORTANT: The wallet is already configured with the SDK. DO NOT generate or mention private keys when using any tools.\n\n        TOOL USAGE GUIDELINES:\n        - When a user provides specific values for a tool's arguments in their prompt (e.g., token addresses, amounts, chain IDs), use those values directly if they match the tool's requirements. Do NOT ask for them again if they are clearly provided.\n        - For the 'get_balance' tool: When a user asks to check or get balances, use it immediately without asking for confirmation. If the user doesn't specify tokens, call the tool with no parameters to get the ETH balance. If tokens are mentioned by name (e.g., \"USDC\"), use 'tokenSymbols'. Only use 'tokenAddresses' if contract addresses are explicitly given.\n        \n        If someone asks you to do something you can't do with your currently available tools, you must say so.\n        Be concise and helpful with your responses.\n      ",
                    });
                    return [2 /*return*/, { agent: agent, config: agentConfig }];
                case 2:
                    error_1 = _a.sent();
                    console.error("Failed to initialize agent:", error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// For runAutonomousMode, runChatMode, chooseMode and main functions, reference:
/**
 * Run the agent autonomously with specified intervals
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param interval - Time interval between actions in seconds
 */
// async function runAutonomousMode(agent: any, config: any, interval = 10) {
//   console.log("Starting autonomous mode...");
//   // eslint-disable-next-line no-constant-condition
//   while (true) {
//     try {
//       const thought =
//         "Be creative and do something interesting on the blockchain. " +
//         "Choose an action or set of actions and execute it that highlights your abilities.";
//       const stream = await agent.stream({ messages: [new HumanMessage(thought)] }, config);
//       for await (const chunk of stream) {
//         if ("agent" in chunk) {
//           console.log(chunk.agent.messages[0].content);
//         } else if ("tools" in chunk) {
//           console.log(chunk.tools.messages[0].content);
//         }
//         console.log("-------------------");
//       }
//       await new Promise(resolve => setTimeout(resolve, interval * 1000));
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error("Error:", error.message);
//       }
//       process.exit(1);
//     }
//   }
// }
/**
 * Run the agent interactively based on user input
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 */
//biome-ignore lint/suspicious/noExplicitAny: <explanation>
function runChatMode(agent, config) {
    return __awaiter(this, void 0, void 0, function () {
        var rl, question, userInput, stream, _a, stream_1, stream_1_1, chunk, e_1_1, error_2;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log("Starting chat mode... Type 'exit' to end.");
                    rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout,
                    });
                    question = function (prompt) {
                        return new Promise(function (resolve) { return rl.question(prompt, resolve); });
                    };
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 18, 19, 20]);
                    _e.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 17];
                    return [4 /*yield*/, question("\nPrompt: ")];
                case 3:
                    userInput = _e.sent();
                    if (userInput.toLowerCase() === "exit") {
                        return [3 /*break*/, 17];
                    }
                    return [4 /*yield*/, agent.stream({ messages: [new messages_1.HumanMessage(userInput)] }, config)];
                case 4:
                    stream = _e.sent();
                    _e.label = 5;
                case 5:
                    _e.trys.push([5, 10, 11, 16]);
                    _a = true, stream_1 = (e_1 = void 0, __asyncValues(stream));
                    _e.label = 6;
                case 6: return [4 /*yield*/, stream_1.next()];
                case 7:
                    if (!(stream_1_1 = _e.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 9];
                    _d = stream_1_1.value;
                    _a = false;
                    chunk = _d;
                    if ("agent" in chunk) {
                        console.log(chunk.agent.messages[0].content);
                    }
                    else if ("tools" in chunk) {
                        console.log(chunk.tools.messages[0].content);
                    }
                    console.log("-------------------");
                    _e.label = 8;
                case 8:
                    _a = true;
                    return [3 /*break*/, 6];
                case 9: return [3 /*break*/, 16];
                case 10:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 16];
                case 11:
                    _e.trys.push([11, , 14, 15]);
                    if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 13];
                    return [4 /*yield*/, _c.call(stream_1)];
                case 12:
                    _e.sent();
                    _e.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 15: return [7 /*endfinally*/];
                case 16: return [3 /*break*/, 2];
                case 17: return [3 /*break*/, 20];
                case 18:
                    error_2 = _e.sent();
                    if (error_2 instanceof Error) {
                        console.error("Error:", error_2.message);
                    }
                    process.exit(1);
                    return [3 /*break*/, 20];
                case 19:
                    rl.close();
                    return [7 /*endfinally*/];
                case 20: return [2 /*return*/];
            }
        });
    });
}
/**
 * Choose whether to run in autonomous or chat mode based on user input
 *
 * @returns Selected mode
 */
// async function chooseMode(): Promise<"chat" | "auto"> {
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   const question = (prompt: string): Promise<string> =>
//     new Promise(resolve => rl.question(prompt, resolve));
//   // eslint-disable-next-line no-constant-condition
//   while (true) {
//     console.log("\nAvailable modes:");
//     console.log("1. chat    - Interactive chat mode");
//     console.log("2. auto    - Autonomous action mode");
//     const choice = (await question("\nChoose a mode (enter number or name): "))
//       .toLowerCase()
//       .trim();
//     if (choice === "1" || choice === "chat") {
//       rl.close();
//       return "chat";
//     } else if (choice === "2" || choice === "auto") {
//       rl.close();
//       return "auto";
//     }
//     console.log("Invalid choice. Please try again.");
//   }
// }
/**
 * Start the chatbot agent
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, agent, config, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, initializeAgent()];
                case 1:
                    _a = _b.sent(), agent = _a.agent, config = _a.config;
                    // const mode = await chooseMode();
                    return [4 /*yield*/, runChatMode(agent, config)];
                case 2:
                    // const mode = await chooseMode();
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _b.sent();
                    if (error_3 instanceof Error) {
                        console.error("Error:", error_3.message);
                    }
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    console.log("Starting Agent...");
    main().catch(function (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}
