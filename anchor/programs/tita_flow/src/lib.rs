use anchor_lang::prelude::*;

declare_id!("4qgU6nZVrBQdYoaKHNBZju32cX3QqKhhDx23m3VCCuHp");

pub mod instructions;
use crate::instructions::*;

pub mod states;
use crate::states::*;

pub mod errors;
use crate::errors::*;

#[program]
pub mod tita_flow {

    use super::*;

    // pub fn initialize_program(ctx: Context<Initialize>) -> Result<()> {
    //     msg!("Greetings from: {:?}", ctx.program_id);
    //     Ok(())
    // }

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

    pub fn contribute(ctx: Context<Initialize>) -> Result<()> {
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
