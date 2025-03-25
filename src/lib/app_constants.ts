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
}
