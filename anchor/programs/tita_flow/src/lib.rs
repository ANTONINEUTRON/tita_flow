use anchor_lang::prelude::*;

declare_id!("4qgU6nZVrBQdYoaKHNBZju32cX3QqKhhDx23m3VCCuHp");

pub mod instructions;
use crate::instructions::*;

pub mod states;
use crate::states::*;

pub mod constants;
use crate::constants::*;

pub mod errors;

#[program]
pub mod tita_flow {
    use super::*;

    // Create a RAISE and DISTRIBUTE flow
    // RAISE FLOW - for accepting contributions from different users
    // DISTRIBUTE FLOW - can only have one donor, the grant it is tied to 
    pub fn create_flow(
        ctx: Context<CreateFlow>,
        flow_id: String,
        goal: u64,
        start_time: Option<i64>,
        end_time: Option<i64>,
        milestones: Option<Vec<Milestone>>
    ) -> Result<()> {
        let _ = ctx.accounts.create(
            flow_id,
            goal,
            start_time,
            end_time,
            milestones,
            ctx.accounts.flow.bump
        )?;

        Ok(())
    }
    


    // pub fn create_weighted_flow(
    //     ctx: Context<CreateWeightedFlow>,
    //     flow_id: String,
    //     goal: u64,
    //     start_time: Option<i64>,
    //     end_time: Option<i64>,
    //     allocations: Vec<WeightedAllocation>
    // ) -> Result<()> {
    //     Ok(())
    // }

    // pub fn contribute(
    //     ctx: Context<Initialize>,
    //     amount: u64,
    // ) -> Result<()> {
    //     // let _ = ctx.accounts.contribute(amount, ctx.bumps.contribution)?;
    //     Ok(())
    // }

    // pub fn withdraw(ctx: Context<Initialize>) -> Result<()> {
    //     msg!("Greetings from: {:?}", ctx.program_id);
    //     Ok(())
    // }
}

#[derive(Accounts)]
pub struct Initialize {}
