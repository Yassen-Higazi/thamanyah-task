import { ClsService } from "nestjs-cls";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";

import { VideoModel } from "../models/video.model";
import { PodcastModel } from "../models/podcast.model";
import { EpisodeModel, EpisodeAttr } from "../models/episode.model";
import { Pagination } from "src/shared/types/pagination.type";

@Injectable()
export class EpisodesRepository {
  constructor(
    private readonly clsService: ClsService,
    @InjectModel(EpisodeModel)
    private readonly episodesModel: typeof EpisodeModel,
  ) {}

  async createEpisode(data: EpisodeAttr) {
    data.isPublished = false;

    return this.episodesModel.create(data as any, {
      transaction: this.clsService.get("transaction"),
    });
  }

  async checkEpisodeByTitle(title: string) {
    const episode = await this.episodesModel.findOne({
      where: { title },
      attributes: ["id"],
      transaction: this.clsService.get("transaction"),
    });

    return !!episode;
  }

  async checkEpisodeById(id: number) {
    const episode = await this.episodesModel.findOne({
      where: { id },
      attributes: ["id"],
      transaction: this.clsService.get("transaction"),
    });

    return !!episode;
  }

  async getEpisode(id: number) {
    return this.episodesModel.findOne({
      where: { id },
      transaction: this.clsService.get("transaction"),
      attributes: ["id", "podcastId", "isPublished"],
    });
  }

  async getEpisodeById(id: number) {
    return this.episodesModel.findOne({
      where: { id },
      attributes: [
        "id",
        "title",
        "guests",
        "presenter",
        "createdAt",
        "isPublished",
        "publishedAt",
        "descriptions",
        "searchKeywords",
      ],
      transaction: this.clsService.get("transaction"),
      include: [
        { model: PodcastModel, attributes: ["id", "title"], required: true },
        {
          required: false,
          model: VideoModel,
          attributes: ["id", "manifestPath", "duration"],
        },
      ],
    });
  }

  async getPodcastEpisodes(podcastId: number) {
    const pagination = this.clsService.get<Pagination>("pagination");

    return this.episodesModel.findAndCountAll({
      where: { podcastId },
      limit: pagination?.limit || undefined,
      offset: pagination?.offset || undefined,
      transaction: this.clsService.get("transaction"),
      attributes: ["id", "title", "descriptions", "thumbnail"],
      include: [
        { model: VideoModel, attributes: ["id", "manifestPath", "duration"] },
      ],
    });
  }

  async updateEpisode(id: number, data: Partial<EpisodeModel>) {
    return this.episodesModel.update(data, {
      where: { id },
      transaction: this.clsService.get("transaction"),
    });
  }

  async findEpisodesByIds(id: number | number[]) {
    const pagination = this.clsService.get<Pagination>("pagination");

    return this.episodesModel.findAndCountAll({
      where: { id },
      limit: pagination?.limit || undefined,
      offset: pagination?.offset || undefined,
      transaction: this.clsService.get("transaction"),
      attributes: [
        "id",
        "title",
        "descriptions",
        "thumbnail",
        "presenter",
        "guests",
      ],
    });
  }

  async getPublishedEpisode(podcastId: number) {
    const pagination = this.clsService.get<Pagination>("pagination");

    return this.episodesModel.findAndCountAll({
      limit: pagination?.limit || undefined,
      offset: pagination?.offset || undefined,
      attributes: [
        "id",
        "title",
        "guests",
        "thumbnail",
        "presenter",
        "createdAt",
        "publishedAt",
        "descriptions",
      ],
      where: { podcastId, isPublished: true },
      transaction: this.clsService.get("transaction"),
      include: [
        { model: VideoModel, attributes: ["id", "duration", "manifestPath"] },
      ],
    });
  }
}
