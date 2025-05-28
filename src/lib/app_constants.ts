import { Connection } from "@solana/web3.js";
import { SupportCurrency } from "./types/supported_currencies";

/**
 * Application-wide constants
 */
export class AppConstants {
  /**
   * The name of the application
   */
  public static readonly APP_NAME = "Tita Flow";
  
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
    TWITTER: "https://x.com/titaflow_",
    DISCORD: "https://discord.gg/titaflow_"
  };
  
  /**
   * Support contact information
   */
  public static readonly SUPPORT_EMAIL = "antobuilds@gmail.com";

  public static readonly APP_URL = "https://titaflow.setita.com"

  public static readonly APP_RPC_ENDPOINT = "https://devnet.helius-rpc.com/?api-key=" + process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  // https://mainnet.helius-rpc.com/?api-key=ammmmmm

  public static readonly APP_CONNECTION: Connection = new Connection(AppConstants.APP_RPC_ENDPOINT, "confirmed");

  // The DB Tables
  public static readonly FLOW_TABLE = "funding_flows";
  public static readonly USER_TABLE = "users";
  public static readonly CONT_TABLE = "contributions";
  public static readonly UPDATE_TABLE = "updates";
  public static readonly COMMENT_TABLE = "comments";
  public static readonly NOTIFICATIONS_TABLE = "notifications";

  public static readonly TITA_FLOW_SEED = Buffer.from("tita-flow");
  public static readonly TITA_FLOW_TA_SEED = Buffer.from("tita-flow-ta");
  public static readonly TITA_CONTRIBUTION_SEED = Buffer.from("tita-contribution");

  public static readonly SUPPORTEDCURRENCIES: SupportCurrency[] = [
    {
      name: "SOL",
      address: "So11111111111111111111111111111111111111112",
      decimals: 9,
      logo: "/icon/solana.png",
      canBeUsed: false
    },
    {
      name: "USDCt",
      address: "61DVYzrDYcAqx8oVQ8jixoEYfGhLz1dvmcYic3qJEzYU",//"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 
      decimals: 6,
      logo: "/icon/usdc.png",
      canBeUsed: true
    },
    {
        name: "USDTt",
        address: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",//"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", 
        decimals: 6,
        logo: "/icon/usdt.png",
        canBeUsed: true
    },
    // {
    //     name: "SEND",
    //     address: "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa", 
    //     decimals: 9,
    // },
  ];

}
