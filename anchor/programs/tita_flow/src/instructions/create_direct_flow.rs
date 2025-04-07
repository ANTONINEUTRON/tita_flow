use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use crate::{
    errors::TitaErrors,
    states::{Flow, FlowStatus, Vault, VaultType},
    constants::{TITA_FLOW_SEED, TITA_VAULT_SEED}
};

#[derive(Accounts)]
#[instruction(
    flow_id: String,
    goal: u64,
    start_time: Option<i64>,
    end_time: Option<i64>
)]
pub struct CreateDirectFlow<'info> {
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
    pub vault: Account<'info, Vault>,
    
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateDirectFlow<'info> {
    pub fn create(
        &mut self,
        flow_id: String,
        goal: u64,
        start_time: Option<i64>,
        end_time: Option<i64>,
        flow_bump: u8,
        vault_bump: u8
    ) -> Result<()> {
        // Initialize flow account
    let flow = &mut self.flow;
    flow.flow_id = flow_id;
    flow.creator = self.creator.key();
    flow.token_mint = self.token_mint.key();
    flow.goal = goal;
    flow.raised = 0;
    flow.start_date = start_time;
    flow.end_date = end_time;
    flow.flow_status = FlowStatus::Active;
    flow.contributor_count = 0;
    flow.primary_vault = self.vault.key();
    flow.bump = flow_bump;
    
    // // Initialize vault account
    let vault = &mut self.vault;
    vault.flow = flow.key();
    vault.token_mint = self.token_mint.key();
    vault.amount = 0;
    vault.vault_type = VaultType::Direct;
    vault.milestone_deadline = None;
    vault.milestone_completed = None;
    vault.recipient = None;
    vault.weight = None;
    vault.bump = vault_bump;
    
    // // Emit flow creation event
    emit!(FlowCreatedEvent {
        flow_id: flow.flow_id.clone(),
        creator: flow.creator,
        flow_type: FlowType::Direct,
        goal,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
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

