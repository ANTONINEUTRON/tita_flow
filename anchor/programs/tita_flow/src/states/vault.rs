use anchor_lang::prelude::*;


#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub enum VaultType {
    Direct,
    Milestone,
    Weighted
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub flow: Pubkey,            // Parent flow
    pub token_mint: Pubkey,      // Token mint
    pub amount: u64,             // Amount allocated to this vault
    
    // Type-specific fields (only one of these would be populated)
    pub vault_type: VaultType,   // Direct, Milestone, or Weighted
    
    // For milestone vaults
    pub milestone_deadline: Option<i64>,
    pub milestone_completed: Option<bool>,
    
    // For weighted vaults
    pub recipient: Option<Pubkey>,  
    pub weight: Option<u32>, // Weight for distribution (basis points)
    
    pub bump: u8,
}