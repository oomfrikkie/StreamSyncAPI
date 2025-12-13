import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  new_password: string;
}
