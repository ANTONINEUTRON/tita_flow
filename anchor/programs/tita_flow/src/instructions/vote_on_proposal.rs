use anchor_lang::prelude::*;

use crate::{errors::TitaErrors, states::{Contribution, Flow, FlowStatus, Proposal, ProposalStatus, ProposalType, VoteType, VotingPowerModel}};

#[derive(Accounts)]
pub struct VoteOnProposal<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    
    #[account(
        mut,
        constraint = proposal.status == ProposalStatus::Active @ TitaErrors::ProposalNotActive,
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        mut, 
        constraint = flow.key() == proposal.flow @ TitaErrors::InvalidFlow,
        constraint = flow.active_proposal.unwrap() == proposal.key() @ TitaErrors::InvalidProposal
    )]
    pub flow: Account<'info, Flow>,
    
    #[account(
        constraint = contribution.flow == flow.key() @ TitaErrors::InvalidContribution,
        constraint = contribution.contributor == voter.key() @ TitaErrors::UnauthorizedVoter,
    )]
    pub contribution: Account<'info, Contribution>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> VoteOnProposal<'info> {

    pub fn vote(
        &mut self,
        vote_type: VoteType
    ) -> Result<()> {
        let proposal = &mut self.proposal;
        let flow = &mut self.flow;
        let contribution = &self.contribution;
        
        // Calculate voting power
        let voting_power = calculate_voting_power(contribution, flow)?;
        
        // Record the vote
        match vote_type {
            VoteType::For => {
                proposal.votes_for = proposal.votes_for
                    .checked_add(voting_power)
                    .ok_or(TitaErrors::MathOverflow)?;
            },
            VoteType::Against => {
                proposal.votes_against = proposal.votes_against
                    .checked_add(voting_power)
                    .ok_or(TitaErrors::MathOverflow)?;
            },
            VoteType::Abstain => {
                proposal.votes_abstain = proposal.votes_abstain
                    .checked_add(voting_power)
                    .ok_or(TitaErrors::MathOverflow)?;
            },
        }
        
        // Check if thresholds are met for execution
        if proposal.check_execution_threshold()? {
            // Execute the proposal action
            match proposal.proposal_type {
                ProposalType::MilestoneCompletion { milestone_id } => {
                    // Find the milestone and mark it as completed
                if let Some(milestones) = &mut flow.milestones {
                    let milestone = milestones.iter_mut()
                        .find(|m| m.id == milestone_id)
                        .ok_or(TitaErrors::MilestoneNotFound)?;
                    
                    // Ensure milestone isn't already completed
                    require!(!milestone.completed, TitaErrors::MilestoneAlreadyCompleted);
                    
                    // Mark milestone as completed
                    milestone.completed = true;
                    
                    msg!("Milestone {} has been completed by governance vote", milestone_id);
                } else {
                    return err!(TitaErrors::NotMilestoneFlow);
                }
                        },
                ProposalType::FlowCancellation => {
                    // Ensure flow is in a state that can be canceled
                require!(
                    flow.flow_status == FlowStatus::Active,
                    TitaErrors::CannotCancelFlow
                );
                
                // Set flow status to canceled
                flow.flow_status = FlowStatus::Canceled;
                
                msg!("Flow has been canceled by governance vote");
                
                // Funds distribution after cancellation would typically be handled
                // by a separate instruction, as it requires different accounts
                },
                ProposalType::MilestoneAdjustment { milestone_id, new_amount, new_deadline } => {
                    // Find milestone
                if let Some(milestones) = &mut flow.milestones {
                    let milestnes =  &mut milestones.clone();
                    let milestone = milestnes.iter_mut()
                        .find(|m| m.id == milestone_id)
                        .ok_or(TitaErrors::MilestoneNotFound)?;
                    
                    // Ensure milestone isn't already completed
                    require!(!milestone.completed, TitaErrors::MilestoneAlreadyCompleted);
                    
                    // Update milestone amount if provided
                    if let Some(amount) = new_amount {
                        // Validate the new amount doesn't exceed flow goal
                        let current_total: u64 = milestones.iter()
                            .map(|m| m.amount)
                            .sum();
                        let adjustment = amount.checked_sub(milestone.amount)
                            .ok_or(TitaErrors::MathOverflow)?;
                        
                        let new_total = current_total.checked_add(adjustment)
                            .ok_or(TitaErrors::MathOverflow)?;
                        
                        require!(
                            new_total <= flow.goal,
                            TitaErrors::InvalidMilestoneAdjustment
                        );
                        
                        // Apply the new amount
                        milestone.amount = amount;
                        msg!("Milestone {} amount updated to {}", milestone_id, amount);
                    }
                    
                    // Update milestone deadline if provided
                    if let Some(deadline) = new_deadline {
                        // Ensure new deadline is in the future
                        let current_time = Clock::get()?.unix_timestamp;
                        require!(
                            deadline > current_time,
                            TitaErrors::InvalidMilestoneDeadline
                        );
                        
                        // Check that new deadline is before flow end date if set
                        if let Some(end_date) = flow.end_date {
                            require!(
                                deadline < end_date,
                                TitaErrors::InvalidMilestoneDeadline
                            );
                        }
                        
                        // Apply the new deadline
                        milestone.deadline = deadline;
                        msg!("Milestone {} deadline updated to {}", milestone_id, deadline);
                    }
                } else {
                    return err!(TitaErrors::NotMilestoneFlow);
                }
                },
                ProposalType::FlowFundingExtension { new_end_date } => {
                    // Validate extension
                let current_time = Clock::get()?.unix_timestamp;
                
                // Ensure new end date is in the future
                require!(
                    new_end_date > current_time,
                    TitaErrors::InvalidFlowExtension
                );
                
                // If current end date exists, ensure new date is later
                if let Some(current_end_date) = flow.end_date {
                    require!(
                        new_end_date > current_end_date,
                        TitaErrors::InvalidFlowExtension
                    );
                }
                
                // Update the flow end date
                flow.end_date = Some(new_end_date);
                
                msg!("Flow end date extended to {}", new_end_date);
                },
            }
            
            // Update proposal status
            proposal.status = ProposalStatus::Executed;
            proposal.executed_at = Some(Clock::get()?.unix_timestamp);
            
            // Clear active proposal from flow
            flow.active_proposal = None;
        }
        
        Ok(())
    }
}


/// Calculate voting power based on the model selected for the flow
///
/// This function implements three voting power models:
/// - TokenWeighted: 1 token = 1 vote (traditional token-weighted voting)
/// - QuadraticVoting: Square root of token amount (reduces whale influence)
/// - IndividualVoting: 1 contributor = 1 vote (equal voting power for all)
pub fn calculate_voting_power(
    contribution: &Contribution,
    flow: &Flow
) -> Result<u64> {
    // Ensure non-zero contribution
    if contribution.total_amount == 0 {
        return err!(TitaErrors::ZeroVotingPower);
    }
    
    // Calculate voting power based on selected model
    match flow.voting_power_model {
        VotingPowerModel::TokenWeighted => {
            // Simple 1 token = 1 vote
            // This gives influence proportional to financial contribution
            Ok(contribution.total_amount)
        },
        
        VotingPowerModel::QuadraticVoting => {
            // Square root of contribution amount
            // This reduces the power gap between small and large contributors
            // Example: 100 tokens = 10 votes, 10,000 tokens = 100 votes (10x tokens = √10x votes)
            let amount = contribution.total_amount as f64;
            let voting_power = (amount.sqrt() as u64).max(1);
            Ok(voting_power)
        },
        
        VotingPowerModel::IndividualVoting => {
            // Each contributor gets exactly 1 vote regardless of contribution amount
            // This creates true democratic voting (one person, one vote)
            Ok(1)
        }
    }
}



/* 
ProposalType::GovernanceParameterChange { 
    new_quorum_percentage,
    new_approval_percentage,
    new_voting_period_days 
} => {
    // Validate new parameters
    if let Some(quorum) = new_quorum_percentage {
        require!(quorum <= 10000, TitaErrors::InvalidGovernanceParameters);
        flow.quorum_percentage = quorum;
        msg!("Quorum percentage updated to {}", quorum);
    }
    
    if let Some(approval) = new_approval_percentage {
        require!(approval <= 10000, TitaErrors::InvalidGovernanceParameters);
        flow.approval_percentage = approval;
        msg!("Approval percentage updated to {}", approval);
    }
    
    if let Some(period) = new_voting_period_days {
        require!(period > 0 && period <= 30, TitaErrors::InvalidGovernanceParameters);
        flow.voting_period_days = period;
        msg!("Voting period updated to {} days", period);
    }
},

ProposalType::VotingModelChange { new_voting_model } => {
    // Update the voting model
    flow.voting_power_model = new_voting_model;
    msg!("Voting model changed");
},
*/