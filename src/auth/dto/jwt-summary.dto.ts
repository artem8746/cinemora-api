import { User } from '@/users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class JwtSummaryDto {
  @ApiProperty({
    description: 'User id',
    type: Number,
    example: 'uuid-1234-5678-9101',
  })
  sub: string;

  @ApiProperty({
    description: 'User email',
    type: String,
    example: 'example@gmail.com',
  })
  email: string;

  constructor(partial: User) {
    this.sub = partial.id;
    this.email = partial.email;
  }
}
