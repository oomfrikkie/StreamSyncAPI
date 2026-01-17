import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@email.com', xml: { name: 'email' } })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
