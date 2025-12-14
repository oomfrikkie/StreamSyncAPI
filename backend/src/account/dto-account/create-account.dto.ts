import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'derjen@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Derjen' })
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Frick' })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: 'strongpassword123' })
  @MinLength(6)
  password: string;
}
