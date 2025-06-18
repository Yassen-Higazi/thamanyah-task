import {
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { FormDataArrayTransform } from "src/shared/utils/fileUpload.utils";

export class CreatePodcastDto {
  @IsNotEmpty()
  @ApiProperty({ type: "string", description: "The title of the Podcast" })
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    type: "string",
    description: "A brief description of the Podcast",
  })
  descriptions: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @FormDataArrayTransform
  @ApiProperty({
    type: "array",
    required: false,
    description: "An array of Keywords to use in search",
  })
  searchKeywords?: string[];

  @ApiProperty({
    format: "binary",
    type: "string",
    required: false,
    description: "A Placeholder Image to show with podcast details",
  })
  thumbnail?: string;
}

export class UpdatePodcastDto {
  @IsNumberString()
  @ApiProperty({
    type: "number",
    required: true,
    description: "The Id of the podcast to update",
  })
  id: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: "string",
    required: false,
    description: "The title of the Podcast",
  })
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: "string",
    required: false,
    description: "A brief description of the Podcast",
  })
  descriptions?: string;

  @IsArray()
  @IsOptional()
  @FormDataArrayTransform
  @IsString({ each: true })
  @ApiProperty({
    type: "array",
    required: false,
    description: "An array of Keywords to use in search",
  })
  searchKeywords?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    format: "binary",
    type: "string",
    required: false,
    description: "A Placeholder Image to show with podcast details",
  })
  thumbnail?: string;
}
