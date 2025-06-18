import {
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UnprocessableEntityException,
} from "@nestjs/common";
import { diskStorage, memoryStorage } from "multer";
import { Transform } from "class-transformer";

const allowedImageTypes = ["image/png", "image/jpg", "image/jpeg"];
// const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

export const defaultImageStorage = diskStorage({
  destination: "./uploads/thumbnails",
  filename(_, file, cb) {
    if (!allowedImageTypes.includes(file.mimetype))
      return cb(
        new UnprocessableEntityException({
          message: "Unacceptibale file type",
        }),
        file.originalname,
      );

    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const defaultVideoStorage = memoryStorage();

export const thumbnailImageValidation = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 30_000_000 }),
    new FileTypeValidator({ fileType: "image/png" }),
    new FileTypeValidator({ fileType: "image/jpeg" }),
    new FileTypeValidator({ fileType: "image/jpg" }),
  ],
});

export const FormDataArrayTransform = Transform(({ value }) => {
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return value as Array<string>; // If already an array, return as is
});
