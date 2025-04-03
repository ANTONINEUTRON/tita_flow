
use anchor_lang::prelude::*;

#[error_code]
pub enum TitaErrors {
    #[msg("Flow ID cannot be empty")]
    EmptyFlowId,

    #[msg("Invalid goal amount")]
    InvalidGoalAmount,

    #[msg("Invalid start time")]
    InvalidStartTime,

    #[msg("Invalid end time")]
    InvalidEndTime,

    #[msg("Invalid timeframe")]
    InvalidTimeframe,

    #[msg("No rules specified")]
    NoRulesSpecified,
    
    #[msg("Incompatible rules combination")]
    IncompatibleRules,

    //contribute
    #[msg("Flow has ended")]
    FlowEnded,

    #[msg("Flow is inactive")]
    InactiveFlow,

    #[msg("Invalid Owner")]
    InvalidOwner,

    #[msg("Invalid Mint")]
    InvalidMint,

    #[msg("Empty distribution")]
    EmptyDistribution,

    #[msg("Invalid amount")]
    InvalidAmount,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Distribution exceeds contribution amount")]
    DistributionExceedsContribution,

    #[msg("Rule not supported")]
    RuleNotSupported,

    #[msg("Insufficient funds")]
    InsufficientFunds
}
