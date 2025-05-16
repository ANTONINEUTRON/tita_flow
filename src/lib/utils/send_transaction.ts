// import { TransactionInstruction } from "@solana/web3.js";

// export const sendTransaction = async (instruction: TransactionInstruction) => {
//     try {
//         // Send the transaction using the wallet's sendTransaction method
//         const { signature } = await walletInstance.sendTransaction(instruction, AppConstants.APP_CONNECTION, {
//             signers: [],
//             preSend: async (tx) => {
//                 console.log("Transaction to be sent:", tx);
//             },
//         });

//         // Wait for confirmation
//         const confirmation = await AppConstants.APP_CONNECTION.confirmTransaction(signature, "confirmed");
//         console.log("Transaction confirmation:", confirmation);

//         return signature;
//     } catch (error) {
//         console.error("Error sending transaction:", error);
//         throw error;
//     }
// }