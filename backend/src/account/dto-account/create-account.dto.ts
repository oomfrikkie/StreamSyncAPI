import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'derjen@email.com', xml: { name: 'email' } })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Derjen', xml: { name: 'first_name' } })
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Frick', xml: { name: 'last_name' } })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: 'strongpassword123', xml: { name: 'password' } })
  @MinLength(6)
  password: string;
}
