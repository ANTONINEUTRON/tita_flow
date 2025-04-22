use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use crate::{
    constants::{TITA_FLOW_SEED, TITA_FLOW_TA_SEED}, errors::TitaErrors, states::{Flow, FlowStatus, Milestone, VotingPowerModel}
};

#[derive(Accounts)]
#[instruction(
    flow_id: String,
    goal: u64,
    start_time: Option<i64>,
    end_time: Option<i64>,
    milestones: Option<Vec<Milestone>>
)]
pub struct CreateFlow<'info> {
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
    )]
    pub flow: Account<'info, Flow>,

    #[account(
        init,
        payer = creator,
        seeds = [
            TITA_FLOW_TA_SEED,
            flow.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
        token::mint = token_mint,
        token::authority = flow, // PDA will be the authority
    )]
    pub flow_token_account: InterfaceAccount<'info, TokenAccount>,
    
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateFlow<'info> {
    pub fn create(
        &mut self,
        flow_id: String,
        goal: u64,
        start_time: Option<i64>,
        end_time: Option<i64>,
        milestones: Option<Vec<Milestone>>,
        voting_power_model: VotingPowerModel,
        flow_bump: u8
    ) -> Result<()> {
        // Validate time parameters if provided
        let current_time = Clock::get()?.unix_timestamp;
        
        // If start time is specified, ensure it's not in the past
        if let Some(start) = start_time {
            require!(
                start >= current_time,
                TitaErrors::InvalidStartTime
            );
        }
        
        // If both start and end times are specified, ensure end is after start
        if let (Some(start), Some(end)) = (start_time, end_time) {
            require!(
                end > start,
                TitaErrors::InvalidTimeframe
            );
        }
        
        // If end time is specified, ensure it's in the future
        if let Some(end) = end_time {
            require!(
                end > current_time,
                TitaErrors::InvalidTimeframe
            );
        }
        
        // Validate milestones if provided
        if let Some(milestones_vec) = &milestones {
            // Ensure we don't exceed maximum milestone count
            require!(
                milestones_vec.len() <= 10,
                TitaErrors::TooManyMilestones
            );
            
            // Ensure we have at least one milestone
            require!(
                !milestones_vec.is_empty(),
                TitaErrors::NoMilestonesSpecified
            );
            
            let mut total_amount = 0u64;
            
            // Validate each milestone
            for milestone in milestones_vec {
                // Validate milestone amount
                require!(
                    milestone.amount > 0,
                    TitaErrors::InvalidMilestoneAmount
                );
                
                // Validate milestone deadline is in the future
                require!(
                    milestone.deadline > current_time,
                    TitaErrors::InvalidMilestoneDeadline
                );

                //ensure milestone withdrawn is false
                require!(
                    !milestone.completed,
                    TitaErrors::MilestoneCantBeCompletedAtCreation
                );
                
                // If end time is specified, ensure milestone deadline is before end time
                if let Some(end) = end_time {
                    require!(
                        milestone.deadline <= end,
                        TitaErrors::MilestoneAfterEndTime
                    );
                }
                
                // Sum milestone amounts with overflow check
                total_amount = total_amount
                    .checked_add(milestone.amount)
                    .ok_or(TitaErrors::MathOverflow)?;
            }
            
            // Ensure milestone amounts add up to the goal
            require!(
                total_amount == goal,
                TitaErrors::MilestoneTotalMismatch
            );
        }
        
        // Initialize flow account
        let flow = &mut self.flow;
        flow.flow_id = flow_id;
        flow.creator = self.creator.key();
        flow.token_mint = self.token_mint.key();
        flow.goal = goal;
        flow.raised = 0;
        flow.balance = 0;   
        flow.available = 0;
        flow.withdrawn = 0;
        flow.flow_ta = self.flow_token_account.key();
        flow.start_date = start_time;
        flow.end_date = end_time;
        flow.flow_status = FlowStatus::Active;
        flow.contributor_count = 0;
        flow.milestones = milestones;
        flow.proposal_count = 0;
        flow.voting_power_model = voting_power_model;
        flow.active_proposal = None;
        flow.total_refunded = 0;
        flow.refunds_count = 0;
        flow.bump = flow_bump;
        
        // Emit event for flow creation
        emit!(FlowCreatedEvent {
            flow_id: flow.flow_id.clone(),
            creator: flow.creator,
            is_milestone: flow.milestones.is_some(),
            goal,
            timestamp: current_time,
        });
        
        Ok(())
    }
}

// Event for flow creation
#[event]
pub struct FlowCreatedEvent {
    pub flow_id: String,
    pub creator: Pubkey,
    pub is_milestone: bool,
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

