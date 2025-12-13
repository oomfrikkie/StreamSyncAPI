import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
