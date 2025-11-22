import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'Public URL of the uploaded file',
    type: String,
    example: 'https://r2.example.com/users/123/avatar-1234567890.jpg',
  })
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}
