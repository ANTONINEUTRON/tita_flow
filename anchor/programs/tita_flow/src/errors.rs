use anchor_lang::prelude::*;

#[error_code]
pub enum TitaErrors {
    #[msg("Invalid amount")]
    InvalidAmount
}