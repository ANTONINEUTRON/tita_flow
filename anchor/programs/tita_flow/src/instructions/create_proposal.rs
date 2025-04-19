use anchor_lang::prelude::*;

use crate::{
    constants::TITA_PROPOSAL_SEED,
    errors::TitaErrors,
    states::{Flow, Proposal, ProposalStatus, ProposalType},
};

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,

    #[account(
        mut,
        constraint = flow.active_proposal.is_none() @ TitaErrors::ActiveProposalExists
    )]
    pub flow: Account<'info, Flow>,

    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [
            TITA_PROPOSAL_SEED,
            flow.key().as_ref(),
            &[flow.proposal_count.checked_add(1).unwrap()]
        ],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateProposal<'info> {
    pub fn create_proposal(
        &mut self,
        proposal_type: ProposalType,
        voting_duration: i64,
        quorum_percentage: u16,
        approval_percentage: u16,
        bump: u8,
    ) -> Result<()> {
        let flow = &mut self.flow;
        let proposal = &mut self.proposal;

        // Initialize proposal
        proposal.flow = flow.key();
        proposal.proposer = self.proposer.key();
        proposal.proposal_type = proposal_type;
        proposal.status = ProposalStatus::Active;
        proposal.created_at = Clock::get()?.unix_timestamp;
        proposal.voting_ends_at = proposal.created_at + voting_duration;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.votes_abstain = 0;
        proposal.total_eligible_votes = flow.raised;
        proposal.executed_at = None;
        proposal.quorum_percentage = quorum_percentage;
        proposal.approval_percentage = approval_percentage;
        proposal.last_vote_check = proposal.created_at;
        proposal.bump = bump;

        // Update flow with active proposal
        flow.active_proposal = Some(proposal.key());
        flow.proposal_count = flow.proposal_count.checked_add(1).unwrap();

        Ok(())
    }
}
