import { ClsService } from "nestjs-cls";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";

import { EpisodeModel } from "../models/episode.model";
import { VideoAttr, VideoModel } from "../models/video.model";

@Injectable()
export class VideosRepository {
  constructor(
    @InjectModel(VideoModel)
    private readonly videosModel: typeof VideoModel,
    private readonly clsService: ClsService,
  ) {}

  async createVideo(data: VideoAttr) {
    return this.videosModel.create(data as any, {
      transaction: this.clsService.get("transaction"),
    });
  }

  async checkVideoByEpisodeId(episodeId: number) {
    return this.videosModel.findOne({
      attributes: ["id"],
      transaction: this.clsService.get("transaction"),
      include: {
        attributes: [],
        model: EpisodeModel,
        where: { id: episodeId },
      },
    });
  }

  async updateVideo(id: number, data: Partial<VideoModel>) {
    return this.videosModel.update(data, {
      where: { id },
      transaction: this.clsService.get("transaction"),
    });
  }
}
