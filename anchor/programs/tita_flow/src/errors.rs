
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
}
