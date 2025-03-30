// use anchor_lang::prelude::*;

// use crate::states::ProgramState;

// #[derive(Accounts)]
// pub struct InitializeProgram<'info> {
//     #[account(
//         init,
//         payer = authority,
//         space = 8 + std::mem::size_of::<ProgramState>(),
//         seeds = [b"program-state"],
//         bump
//     )]
//     pub program_state: Account<'info, ProgramState>,
    
//     /// The authority that can update program settings
//     #[account(mut)]
//     pub authority: Signer<'info>,
    
//     /// Account that receives fees
//     pub fee_account: AccountInfo<'info>,
    
//     pub system_program: Program<'info, System>,
// }