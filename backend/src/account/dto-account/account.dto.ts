import { ApiProperty } from '@nestjs/swagger';

export class AccountDto {
  @ApiProperty({ example: 1, xml: { name: 'id' } })
  id: number;

  @ApiProperty({ example: 'user@email.com', xml: { name: 'email' } })
  email: string;

  @ApiProperty({ example: 'Derjen', xml: { name: 'first_name' } })
  first_name: string;

  @ApiProperty({ example: 'Frick', xml: { name: 'last_name' } })
  last_name: string;
}
