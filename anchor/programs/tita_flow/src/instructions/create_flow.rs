use anchor_lang::prelude::*;

use crate::states::*;


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


#[derive(Accounts)]
#[instruction(params: FlowParams)]
pub struct CreateFlow<'info> {

    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
