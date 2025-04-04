use anchor_lang::prelude::*;

declare_id!("4qgU6nZVrBQdYoaKHNBZju32cX3QqKhhDx23m3VCCuHp");

pub mod instructions;
use crate::instructions::*;

pub mod states;
use crate::states::*;

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
        flow_type: FlowType,
        goal: u64,
        start_time: Option<i64>,
        end_time: Option<i64>,
        rules: Vec<RuleType>,
        voting_mechanisms: Vec<VotingMechanism>,
    ) -> Result<()> {
        let _ = ctx.accounts.init_flow(
            flow_id,
            flow_type,
            goal,
            start_time,
            end_time,
            rules,
            voting_mechanisms,
            ctx.bumps.flow,
        )?;

        Ok(())
    }

    pub fn contribute_direct(
        ctx: Context<ContributeDirect>,
        amount: u64,
    ) -> Result<()> {
        let _ = ctx.accounts.contribute(amount, ctx.bumps.contribution)?;
        Ok(())
    }


    pub fn contribute_milestones(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }


    pub fn contribute_weighted(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn create_proposal(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn vote(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn close(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
