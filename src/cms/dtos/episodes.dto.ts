import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { FormDataArrayTransform } from "src/shared/utils/fileUpload.utils";

export class CreateEpisodeDto {
  @IsNotEmpty()
  @ApiProperty({ type: "string", description: "The title of the Episode" })
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    type: "string",
    description: "A brief description of the Episode",
  })
  descriptions: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @FormDataArrayTransform
  @IsString({ each: true })
  @ApiProperty({
    type: "array",
    required: false,
    description: "An array of Keywords to use in search",
  })
  searchKeywords?: string[];

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "A Placeholder Image to show with episode details",
  })
  thumbnail?: string;

  @IsNotEmpty()
  @ApiProperty({ description: "The Category of this episode", required: true })
  category: string;

  @IsNotEmpty()
  @ApiProperty({ description: "The presenter of this episode", required: true })
  presenter: string;

  @IsArray()
  @ArrayMinSize(1)
  @FormDataArrayTransform
  @IsString({ each: true }) // Validate each item in the array
  @IsNotEmpty({ each: true }) // Ensure each string in array is not empty
  @ApiProperty({
    description: "The list of this episode guests",
    required: true,
  })
  guests: string[];

  @IsNumberString()
  @ApiProperty({
    description: "The id of the podcast of this episode",
    required: true,
  })
  podcastId: number;
}

export class UpdateEpisodeDto {
  @IsNumberString()
  @ApiProperty({
    type: "number",
    required: true,
    description: "The Id of the episode to update",
  })
  id: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: "string",
    required: false,
    description: "The title of the Episode",
  })
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: "string",
    required: false,
    description: "A brief description of the Episode",
  })
  descriptions?: string;

  @IsArray()
  @IsOptional()
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
    description: "A Placeholder Image to show with episode details",
  })
  thumbnail?: string;
}

export class UploadeEpisodeVideo {
  @IsNotEmpty()
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "The video to upload",
  })
  videoFile: Express.Multer.File;
}

export class UPloadTusEpisodeVideo {
  path: string;
  episodeId: string;
  originalFilename: string;
  extention: string;
  size: number;
  filetype: string;
}
