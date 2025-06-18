import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SearchPodcastsDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    required: true,
    example: "Technology in Our Life | Yassen Higazi",
    description:
      "Title, descriptions, keywords, presenter, or guest names to search for",
  })
  searchTerm: string;

  // @IsString()
  // @IsNotEmpty()
  // @IsOptional()
  // @ApiProperty({
  //   required: false,
  //   example: "Technology podcast",
  //   description: "Podcast descriptions to search for",
  // })
  // descriptions?: string;
}

export class searchEpisodesDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    required: true,
    example: "Technology in Our Life | Yassen Higazi",
    description:
      "Title, descriptions, keywords, presenter, or guest names to search for",
  })
  searchTerm: string;
}
