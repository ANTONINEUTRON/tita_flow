
export interface UserPreferences {
  notifications?: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  displayCurrency?: string;
  timezone?: string;
  language?: string;
}

export default interface AppUser {
  id: string;
  email: string;
  wallet: string;
  username: string;
  name: string;
  profile_pics?: string;
  preferences?: UserPreferences;
}
