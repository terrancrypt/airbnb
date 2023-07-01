import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    type: String,
    format: 'binary',
  })
  file: any;
}
