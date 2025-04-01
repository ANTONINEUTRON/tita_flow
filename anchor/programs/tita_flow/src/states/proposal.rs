use anchor_lang::prelude::*;

use super::VotingMechanism;

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub flow: Pubkey,                // Flow account this belongs to
    pub proposal_id: u32,            // Proposal ID within flow
    pub creator: Pubkey,             // Creator's wallet address
    pub start_time: i64,             // Start timestamp
    pub end_time: i64,               // End timestamp
    pub option_count: u8,            // Number of options
    pub total_votes: u64,            // Total votes cast
    pub status: ProposalStatus,      // Current status
    pub voting_mechanism: VotingMechanism, // Voting type
    pub bump: u8
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ProposalStatus {
    Active,
    Passed,
    Rejected,
    Expired,
}

#[account]
pub struct ProposalOption {
    pub proposal: Pubkey,            // Proposal account this belongs to
    pub option_id: u8,               // Option ID within proposal
    pub text: String,                // Option text
    pub vote_count: u64,             // Total votes for this option
}