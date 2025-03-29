use anchor_lang::prelude::*;


#[account]
#[derive(InitSpace)]
pub struct ProgramState {
    pub authority: Pubkey,           // Program admin
    pub fee_account: Pubkey,         // Where fees are collected
    pub fee_basis_points: u16,       // Fee percentage in basis points
    pub flow_count: u64,             // Total number of flows created
}
