use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    Mint, 
    TokenAccount, 
    TokenInterface
};

use crate::errors::*;
use crate::states::*;

#[derive(Accounts)]
#[instruction(flow_id: String)]
pub struct CreateFlow<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = Flow::INIT_SPACE + 8,
        seeds = [
            b"tita-flow",
            flow_id.as_bytes(),
            creator.key().as_ref()
        ],
        bump
    )]
    pub flow: Account<'info, Flow>,

    #[account(
        init,
        payer = creator,
        seeds = [
            b"tita-vault",
            flow.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
        token::mint = token_mint,
        token::authority = flow,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>
}



#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct FlowParams {
    pub flow_type: FlowType,
    pub goal: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub metadata_uri: String,
    pub rules: Vec<RuleType>,
    pub voting_mechanisms: Vec<VotingMechanism>,
}

impl<'info> CreateFlow<'info> {
    pub fn init_flow(
        &mut self,
        flow_id: String,
        flow_type: FlowType,
        goal: u64,
        start_time: Option<i64>,
        end_time: Option<i64>,
        rules: Vec<RuleType>,
        voting_mechanisms: Vec<VotingMechanism>,
        bump: u8,
    ) -> Result<()>{
        // Validate flow_id
        require!(!flow_id.is_empty(), TitaErrors::EmptyFlowId);
        // Validate goal amount based on flow type
        require!(goal > 0, TitaErrors::InvalidGoalAmount);
        
        // Validate timestamps
        let current_time = Clock::get()?.unix_timestamp;
        
        // Start time validation
        if let Some(start) = start_time {
            // Start time should not be in the past (with small tolerance for tx processing)
            require!(start >= current_time - 60, TitaErrors::InvalidStartTime);
        }
        
        // End time validation
        if let Some(end) = end_time {
            // If end time is specified, it must be in the future
            require!(end > current_time, TitaErrors::InvalidEndTime);
            
            // If both start and end time are specified, end must be after start
            if let Some(start) = start_time {
                require!(end > start, TitaErrors::InvalidTimeframe);
            }
        }
        
        // Validate rules
        require!(!rules.is_empty(), TitaErrors::NoRulesSpecified);
        
        // Check for incompatible rule combinations
        let mut has_direct = false;
        let mut has_milestone = false;
        let mut has_weighted = false;
        
        for rule in &rules {
            match rule {
                RuleType::Direct => has_direct = true,
                RuleType::Milestone => has_milestone = true,
                RuleType::Weighted => has_weighted = true,
            }
        }
        
        // Validate incompatible rule combinations
        // For example, you might not want to allow both direct and milestone rules
        if has_direct && has_milestone {
            return err!(TitaErrors::IncompatibleRules);
        }
        
        // Validate voting mechanisms if specified
        if !voting_mechanisms.is_empty() {
            // Add specific validations for voting mechanisms
            // For example, validate quorum percentages, durations, etc.
        }
        
        // If all validations pass, initialize the flow
        let flow = &mut self.flow;
        flow.flow_id = flow_id;
        flow.creator = *self.creator.key;
        flow.goal = goal;
        flow.flow_type = flow_type;
        flow.start_date = start_time;
        flow.end_date = end_time;
        flow.rules = rules;
        flow.voting_mechanisms = voting_mechanisms;
        flow.raised = 0;
        flow.contributor_count = 0;
        flow.milestone_count = 0;
        flow.proposal_count = 0;
        flow.flow_status = FlowStatus::Active;
        flow.bump = bump;
        
        // Set default start time if not provided
        if flow.start_date.is_none() {
            flow.start_date = Some(current_time);
        }
        
        // Emit a flow created event
        emit!(FlowCreatedEvent {
            flow_id: flow.flow_id.clone(),
            creator: flow.creator,
            flow_type: flow.flow_type.clone(),
            goal,
            timestamp: current_time,
        });
        
        Ok(())
    }
}


#[event]
pub struct FlowCreatedEvent {
    pub flow_id: String,
    pub creator: Pubkey,
    pub flow_type: FlowType,
    pub goal: u64,
    pub timestamp: i64,
}