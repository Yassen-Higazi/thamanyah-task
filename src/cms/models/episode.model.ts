import { DataTypes } from "sequelize";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Table, BelongsTo, ForeignKey } from "sequelize-typescript";

import { VideoAttr, VideoModel } from "./video.model";
import { PodcastAttr, PodcastModel } from "./podcast.model";
import { BaseModel } from "src/shared/models/base.model";

export class EpisodeAttr {
  @ApiProperty({ description: "Episode id", example: 1 })
  id?: number;

  @ApiProperty({ description: "Episode Title", example: "Tech Talks" })
  title: string;

  @ApiProperty({
    description: "Episode description",
    example: "We talk about latest tech trends",
  })
  descriptions?: string;

  @ApiProperty({
    type: "boolean",
    description: "A flag to indecate if this episode is published or not",
    example: true,
  })
  isPublished?: boolean;

  @ApiProperty({
    description: "The publication date of this episode",
    example: new Date(),
  })
  pulishedAt?: Date;

  @ApiProperty({
    description: "the full path of the episode thumbnail",
    example: "uploads/image1.png",
  })
  thumbnail?: string;

  @ApiProperty({
    description: "An array of keywords to search with",
    example: ["tech", "linux", "software engineering"],
  })
  searchKeywords?: string[];

  @ApiProperty({
    description: "The category of this episode",
    example: "Technology",
  })
  category?: string;

  @ApiProperty({
    description: "The presenter of this episode",
    example: "Yassen",
  })
  presenter?: string;

  @ApiProperty({
    description: "The guests of this episode",
    example: ["Yassen", "Higazi"],
  })
  guests?: string[];

  @ApiProperty({
    description: "The id of the podcast of this episode",
    example: 1,
  })
  podcastId?: number;

  @ApiProperty({
    type: PodcastAttr,
    description: "The details of the podcast of this episode",
    example: PodcastAttr,
  })
  podcast?: PodcastAttr;

  @ApiProperty({ description: "The id of the video model", example: 1 })
  videoId?: number;

  @ApiProperty({
    type: () => VideoAttr,
    description: "The details of the video of this podcast",
  })
  video?: VideoAttr;
}

@Table
export class EpisodeModel extends BaseModel<EpisodeAttr> {
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

  // TODO: Change to table
  @Column({ type: DataTypes.STRING })
  declare presenter: string;

  // TODO: Change to table
  @Column({ type: DataTypes.ARRAY(DataTypes.STRING) })
  declare guests: string[];

  // TODO: change to table
  @Column({ type: DataTypes.STRING })
  declare category: string;

  @Column({ type: DataTypes.INTEGER })
  @ForeignKey(() => PodcastModel)
  declare podcastId: number;

  @Column({ type: DataTypes.INTEGER })
  @ForeignKey(() => VideoModel)
  declare videoId: number;

  @BelongsTo(() => PodcastModel)
  declare podcast: PodcastModel;

  @BelongsTo(() => VideoModel)
  declare video: VideoModel;
}
