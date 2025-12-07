export class CreateTokenDto {
  token_type: string;       // e.g. 'EMAIL_VERIFICATION' or 'PASSWORD_RESET'
  account_id: number;       // which account the token belongs to
  expires_at: Date;         // when it expires
}
