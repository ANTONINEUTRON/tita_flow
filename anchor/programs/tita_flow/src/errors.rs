
use anchor_lang::prelude::*;

#[error_code]
pub enum TitaErrors {
    #[msg("Flow ID cannot be empty")]
    EmptyFlowId,
    
    #[msg("Flow ID exceeds maximum length")]
    FlowIdTooLong,
    
    #[msg("Invalid goal amount")]
    InvalidGoalAmount,
    
    #[msg("Invalid start time")]
    InvalidStartTime,
    
    #[msg("Invalid end time or timeframe")]
    InvalidTimeframe,
    
    #[msg("Flow has ended")]
    FlowEnded,
    
    #[msg("Flow is inactive")]
    InactiveFlow,
    
    // Milestone-specific errors
    #[msg("No milestones specified")]
    NoMilestonesSpecified,
    
    #[msg("Too many milestones specified (max 10)")]
    TooManyMilestones,
    
    #[msg("Empty milestone description")]
    EmptyMilestoneDescription,
    
    #[msg("Milestone description too long")]
    MilestoneDescriptionTooLong,
    
    #[msg("Invalid milestone deadline")]
    InvalidMilestoneDeadline,
    
    #[msg("Invalid milestone weight")]
    InvalidMilestoneWeight,
    
    #[msg("Milestone weights do not add up to 100% (10000 basis points)")]
    MilestoneWeightsIncorrect,
    
    #[msg("Number of milestone accounts does not match milestone configurations")]
    MilestoneAccountsMismatch,
    
    // Weighted allocation-specific errors
    #[msg("No allocations specified")]
    NoAllocationsSpecified,
    
    #[msg("Too many allocations specified (max 10)")]
    TooManyAllocations,
    
    #[msg("Empty allocation description")]
    EmptyAllocationDescription,
    
    #[msg("Allocation description too long")]
    AllocationDescriptionTooLong,
    
    #[msg("Invalid allocation weight")]
    InvalidAllocationWeight,
    
    #[msg("Allocation weights do not add up to 100% (10000 basis points)")]
    AllocationWeightsIncorrect,
    
    #[msg("Number of allocation accounts does not match allocation configurations")]
    AllocationAccountsMismatch,
    
    #[msg("Invalid vault address")]
    InvalidVaultAddress,
    
    #[msg("Math overflow")]
    MathOverflow
}
