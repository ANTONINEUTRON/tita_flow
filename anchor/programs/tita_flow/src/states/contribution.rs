use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Contribution {
    pub is_initialized: bool,        
    pub flow: Pubkey,               
    pub contributor: Pubkey,       
    pub amount: u64,                
    pub timestamp: i64,             
    pub is_anonymous: bool, 
}