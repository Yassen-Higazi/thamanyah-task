import { DataTypes } from "sequelize";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Table, HasMany, Unique } from "sequelize-typescript";

import { EpisodeModel } from "./episode.model";
import { BaseModel } from "src/shared/models/base.model";

export class PodcastAttr {
  @ApiProperty({ description: "Podcast id", example: 1 })
  id?: number;

  @ApiProperty({ description: "Podcast Title", example: "Tech Talks" })
  title: string;

  @ApiProperty({
    description: "Podcast description",
    example: "We talk about latest tech trends",
  })
  descriptions?: string;

  @ApiProperty({
    type: "boolean",
    description: "A flag to indecate if this podcast is published or not",
    example: true,
  })
  isPulished?: boolean;

  @ApiProperty({
    description: "The publication date of this podcast",
    example: new Date(),
  })
  pulishedat?: Date;

  @ApiProperty({
    description: "the full path of the podcast thumbnail",
    example: "uploads/image1.png",
  })
  thumbnail?: string;

  @ApiProperty({
    description: "An array of keywords to search with",
    example: ["tech", "linux", "software engineering"],
  })
  searchKeywords?: string[];

  episodes?: EpisodeModel[];
}

@Table
export class PodcastModel extends BaseModel<PodcastModel> {
  @Unique
  @Column({ type: DataTypes.STRING })
  declare title: string;

  @Column({ type: DataTypes.STRING })
  declare descriptions: string;

  @Column({ type: DataTypes.BOOLEAN, defaultValue: false })
  declare isPublished: boolean;

  @Column({ type: DataTypes.DATE })
  declare publishedAt: Date;

  @Column({ type: DataTypes.STRING })
  declare thumbnail: string;

  @Column({ type: DataTypes.ARRAY(DataTypes.STRING) })
  declare searchKeywords: string[];

  @HasMany(() => EpisodeModel)
  declare episodes: EpisodeModel[];
}
