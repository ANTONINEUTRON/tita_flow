
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

    #[msg(Invalid Contribution Amount)]
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

    
}
