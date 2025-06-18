import { ClsService } from "nestjs-cls";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";

import { EpisodeModel } from "../models/episode.model";
import { PodcastModel, PodcastAttr } from "../models/podcast.model";
import { Pagination } from "src/shared/types/pagination.type";

@Injectable()
export class PodcastsRepository {
  constructor(
    private readonly clsService: ClsService,
    @InjectModel(PodcastModel)
    private readonly podcastsModel: typeof PodcastModel,
  ) {}

  async createPodcast(data: PodcastAttr) {
    data.isPulished = false;

    return this.podcastsModel.create(data as any, {
      transaction: this.clsService.get("transaction"),
    });
  }

  async checkPodcastByTitle(title: string) {
    const podcast = await this.podcastsModel.findOne({
      where: { title },
      attributes: ["id"],
      transaction: this.clsService.get("transaction"),
    });

    return !!podcast;
  }

  async checkPodcastById(id: number) {
    const podcast = await this.podcastsModel.findOne({
      where: { id },
      attributes: ["id"],
      transaction: this.clsService.get("transaction"),
    });

    return !!podcast;
  }

  async getPodcastById(id: number) {
    return this.podcastsModel.findOne({
      where: { id },
      transaction: this.clsService.get("transaction"),
    });
  }

  async getPodcastForPublish(id: number) {
    return this.podcastsModel.findOne({
      where: { id },
      attributes: [
        "id",
        "title",
        "descriptions",
        "searchKeywords",
        "isPublished",
        "publishedAt",
      ],
      transaction: this.clsService.get("transaction"),
      include: [
        {
          attributes: ["id"],
          model: EpisodeModel,
          where: { isPublished: true },
        },
      ],
    });
  }

  async getAllPodcasts() {
    const pagination = this.clsService.get<Pagination>("pagination");

    return this.podcastsModel.findAndCountAll({
      limit: pagination?.limit,
      offset: pagination?.offset,
      transaction: this.clsService.get("transaction"),
      attributes: [
        "id",
        "title",
        "thumbnail",
        "createdAt",
        "publishedAt",
        "descriptions",
      ],
    });
  }

  async getPublishedPodcasts() {
    const pagination = this.clsService.get<Pagination>("pagination");

    return this.podcastsModel.findAndCountAll({
      limit: pagination?.limit,
      offset: pagination?.offset,
      where: { isPublished: true },
      transaction: this.clsService.get("transaction"),
      attributes: [
        "id",
        "title",
        "thumbnail",
        "createdAt",
        "publishedAt",
        "descriptions",
      ],
    });
  }

  async updatePodcast(id: number, data: Partial<PodcastModel>) {
    return this.podcastsModel.update(data, {
      where: { id },
      transaction: this.clsService.get("transaction"),
    });
  }

  async findPodcastsById(id: number | number[]) {
    const pagination = this.clsService.get<Pagination>("pagination");

    return this.podcastsModel.findAndCountAll({
      where: { id },
      limit: pagination?.limit,
      offset: pagination?.offset,
      attributes: [
        "id",
        "title",
        "createdAt",
        "thumbnail",
        "publishedAt",
        "descriptions",
      ],
      transaction: this.clsService.get("transaction"),
    });
  }
}
