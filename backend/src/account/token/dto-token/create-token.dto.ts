import { ApiProperty } from '@nestjs/swagger';

export class CreateTokenDto {
  @ApiProperty()
  token_type: string;

  @ApiProperty()
  account_id: number;

  @ApiProperty()
  expires_at: Date;
}
