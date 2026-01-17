import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ xml: { name: 'email' } })
  @IsEmail()
  email: string;

  @ApiProperty({ xml: { name: 'password' } })
  @IsNotEmpty()
  password: string;
}
