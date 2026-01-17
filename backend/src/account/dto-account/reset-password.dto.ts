import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'uuid-reset-token', xml: { name: 'token' } })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'strongpassword123', xml: { name: 'new_password' } })
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}
