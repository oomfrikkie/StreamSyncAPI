import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyTokenDto {
  @ApiProperty({ example: 'e221080e-a5b6-48ad-b9bb-c01964e3e071' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'EMAIL_VERIFICATION' })
  @IsString()
  @IsNotEmpty()
  token_type: string;
}
