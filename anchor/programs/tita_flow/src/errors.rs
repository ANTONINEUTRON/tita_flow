use anchor_lang::prelude::*;

#[error_code]
pub enum TitaErrors {
    #[msg("Invalid Milestone Amount")]
    InvalidMilestoneAmount,

    #[msg("Empty Flow ID")]
    EmptyFlowId,

    #[msg("Flow ID too long")]  
    FlowIdTooLong,

    #[msg("Invalid Goal Amount")]
    InvalidGoalAmount,

    #[msg("Invalid start time")]
    InvalidStartTime,

    #[msg("Invalid timeframe")]
    InvalidTimeframe,

    #[msg("Too many milestones")]
    TooManyMilestones,

    #[msg("No milestones specified")]
    NoMilestonesSpecified,

    #[msg("Invalid milestone deadline")]
    InvalidMilestoneDeadline,

    #[msg("Milestone deadline is after end time")]
    MilestoneAfterEndTime,

    #[msg("MathOverflow")]
    MathOverflow,

    #[msg("Milestone total mismatch")]
    MilestoneTotalMismatch,

    #[msg("Invalid Contribution Amount")]
    InvalidContributionAmount,

    #[msg("Flow not active")]
    FlowNotActive,

    #[msg("Invalid token mint")]
    InvalidTokenMint,

    #[msg("Invalid token owner")]
    InvalidTokenAccount,

    #[msg("Invalid token owner")]
    InvalidTokenOwner,

    #[msg("Flow ended")]
    FlowEnded,

    #[msg("Flow not started")]
    FlowNotStarted,

    #[msg("Proposal is not in active voting state")]
    VotingNotActive,

    #[msg("Proposal has already been executed")]
    ProposalAlreadyExecuted,
    
    #[msg("Unauthorized cancellation")]
    UnauthorizedCancellation,
    
    #[msg("This flow already has an active proposal")]
    ActiveProposalExists,

    #[msg("This proposal is not currently active for voting")]
    ProposalNotActive,
    
    #[msg("The provided flow doesn't match the proposal's flow")]
    InvalidFlow,
    
    #[msg("This is not the active proposal for this flow")]
    InvalidProposal,
    
    #[msg("The provided contribution doesn't belong to this flow")]
    InvalidContribution,
    
    #[msg("You are not authorized to vote with this contribution account")]
    UnauthorizedVoter,
    
    #[msg("The voting period has not started yet")]
    VotingNotStarted,
    
    #[msg("The voting period has already ended")]
    VotingEnded,
    
    #[msg("You cannot vote with zero voting power")]
    ZeroVotingPower,
    
    #[msg("You have already voted on this proposal")]
    AlreadyVoted,
    
    #[msg("This flow doesn't have any milestones to complete")]
    NotMilestoneFlow,
    
    #[msg("The specified milestone wasn't found in this flow")]
    MilestoneNotFound,
    
    #[msg("This milestone has already been completed")]
    MilestoneAlreadyCompleted,
    
    #[msg("The flow cannot be cancelled in its current state")]
    CannotCancelFlow,
    
    #[msg("The proposed milestone adjustments would exceed the flow's goal")]
    InvalidMilestoneAdjustment,
    
    #[msg("The proposed flow extension date must be after the current end date")]
    InvalidFlowExtension,
}
