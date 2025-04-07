use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use crate::{
    errors::TitaErrors,
    states::{Flow, FlowStatus, Vault, VaultType},
    constants::{TITA_FLOW_SEED, TITA_VAULT_SEED}
};

// Structure to define a milestone
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MilestoneConfig {
    pub description: String,
    pub deadline: i64,
    pub weight: u32, // Percentage in basis points (100% = 10000)
}

#[derive(Accounts)]
#[instruction(
    flow_id: String,
    goal: u64,
    start_time: Option<i64>,
    end_time: Option<i64>,
    milestones: Vec<MilestoneConfig>,
)]
pub struct CreateMilestoneFlow<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + Flow::INIT_SPACE,
        seeds = [
            TITA_FLOW_SEED,
            flow_id.as_bytes(),
            creator.key().as_ref()
        ],
        bump,
        constraint = !flow_id.is_empty() @ TitaErrors::EmptyFlowId,
        constraint = flow_id.len() <= 32 @ TitaErrors::FlowIdTooLong,
        constraint = goal > 0 @ TitaErrors::InvalidGoalAmount,
        constraint = start_time.is_none() || start_time.unwrap() >= Clock::get()?.unix_timestamp @ TitaErrors::InvalidStartTime,
        constraint = end_time.is_none() || 
                    (end_time.unwrap() > Clock::get()?.unix_timestamp && 
                     (start_time.is_none() || end_time.unwrap() > start_time.unwrap())) @ TitaErrors::InvalidTimeframe,
    )]
    pub flow: Account<'info, Flow>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + Vault::INIT_SPACE,
        seeds = [
            TITA_VAULT_SEED,
            flow.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump
    )]
    pub primary_vault: Account<'info, Vault>,
    
    /// CHECK: The milestone vault accounts are initialized in the instruction handler
    /// These must be provided in the same order as the milestones vector
    #[account(mut)]
    pub milestone_vaults: UncheckedAccount<'info>,
    
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CreateMilestoneFlow<'info> {
    pub fn init_flow(
        &mut self,
        flow_id: String,
        goal: u64,
        start_time: Option<i64>,
        end_time: Option<i64>,
    ) -> Result<()> {
    
    Ok(())
    }
    
}

// Event definition
#[event]
pub struct FlowCreatedEvent {
    pub flow_id: String,
    pub creator: Pubkey,
    pub flow_type: FlowType,
    pub goal: u64,
    pub timestamp: i64,
}

// For event use
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum FlowType {
    Direct,
    Milestone,
    Weighted
}