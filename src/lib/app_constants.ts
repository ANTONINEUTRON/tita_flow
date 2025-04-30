import { Connection } from "@solana/web3.js";

/**
 * Application-wide constants
 */
export class AppConstants {
  /**
   * The name of the application
   */
  public static readonly APP_NAME = "Tita";
  
  /**
   * The description of the application
   */
  public static readonly APP_DESCRIPTION = "Configurable rule based funding platform";
  
  /**
   * The base URL of the application
   */
  public static readonly BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://tita.com";
  
  /**
   * Social media links
   */
  public static readonly SOCIAL_LINKS = {
    TWITTER: "https://twitter.com/titafinance",
    GITHUB: "https://github.com/titafinance",
    DISCORD: "https://discord.gg/titafinance"
  };
  
  /**
   * Support contact information
   */
  public static readonly SUPPORT_EMAIL = "support@tita.com";


  public static readonly APP_URL = "https://beta.setita.com"

  public static readonly APP_SOL_ENDPOINT = "https://devnet.helius-rpc.com/?api-key=" + process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  // https://mainnet.helius-rpc.com/?api-key=ammmmmm

  public static readonly APP_CONNECTION: Connection = new Connection(AppConstants.APP_SOL_ENDPOINT, "confirmed");

  // The DB Tables
  public static readonly FLOW_TABLE = "funding_flows";

  
}
