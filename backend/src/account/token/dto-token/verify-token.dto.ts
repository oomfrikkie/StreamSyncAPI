import { ApiProperty } from '@nestjs/swagger';

export class VerifyTokenDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  token_type: string;
}
