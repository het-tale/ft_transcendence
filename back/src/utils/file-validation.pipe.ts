import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (file.fieldname !== 'file') {
      throw new BadRequestException('Invalid file name');
    }

    const fileSize = file.size;
    let fileExtension = file.originalname.split('.').pop();
    fileExtension = fileExtension.trim();

    if (fileSize > 1048576) {
      // 1MB in bytes
      throw new BadRequestException('File size exceeds the limit');
    }

    if (!RegExp(/(jpg|jpeg|png|gif)$/i).exec(fileExtension)) {
      throw new BadRequestException(
        'Invalid file extension. Only JPG, JPEG, PNG, and GIF files are allowed.',
      );
    }

    return file;
  }
}
