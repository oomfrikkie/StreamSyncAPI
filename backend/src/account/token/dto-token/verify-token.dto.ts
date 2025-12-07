export class VerifyTokenDto {
  token: string;        // the raw token sent in the URL
  token_type: string;   // 'EMAIL_VERIFICATION' or 'PASSWORD_RESET'
}
