import { DataTypes } from "sequelize";
import { ApiProperty } from "@nestjs/swagger";
import { Column, HasOne, Table } from "sequelize-typescript";

import { EpisodeModel } from "./episode.model";
import { BaseModel } from "src/shared/models/base.model";

export class VideoAttr {
  id?: number;

  @ApiProperty({
    description: "The original Filename of the uploaded video",
    example: "video.mp4",
  })
  filename: string;

  @ApiProperty({
    description: "The file extention of the original video",
    example: "mp4",
  })
  extention: string;

  @ApiProperty({
    description: "The duration of the video in seconds",
    example: 6000,
  })
  duration: number;

  @ApiProperty({
    example: "./uploads/videos/video.hls",
    description: "The file path or the path of the HLS manifest",
  })
  manifestPath: string;
}

@Table
export class VideoModel extends BaseModel<VideoAttr> {
  @Column({ type: DataTypes.STRING })
  declare filename: string;

  @Column({ type: DataTypes.STRING })
  declare extention: string;

  @Column({ type: DataTypes.INTEGER })
  declare duration: number;

  @Column({ type: DataTypes.STRING })
  declare manifestPath: string;

  @HasOne(() => EpisodeModel)
  declare episode: EpisodeModel;
}
