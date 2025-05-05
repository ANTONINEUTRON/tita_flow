import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import TitaFlowIDL from '../target/idl/tita_flow.json'
import type { TitaFlow } from '../target/types/tita_flow'

// Re-export the generated IDL and type
export { TitaFlow, TitaFlowIDL }

// The programId is imported from the program IDL.
export const TITA_PROGRAM_ID = new PublicKey(TitaFlowIDL.address)

// This is a helper function to get the Basic Anchor program.
export function getTitaFlowProgram(provider: AnchorProvider) {
  return new Program(TitaFlowIDL as TitaFlow, provider)
}
