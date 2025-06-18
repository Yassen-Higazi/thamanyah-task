import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";

import { PodcastAttr } from "../models/podcast.model";
import { EpisodeAttr } from "../models/episode.model";

import { PodcastsRepository } from "../repositories/podcast.repository";
import { CreatePodcastDto, UpdatePodcastDto } from "../dtos/podcasts.dto";

@Injectable()
export class PodcastsService {
  readonly elasticsearchIndex = "podcasts";

  constructor(
    private readonly podcastRepo: PodcastsRepository,
    private readonly esService: ElasticsearchService,
  ) {}

  async getAllPodcast() {
    return this.podcastRepo.getAllPodcasts();
  }

  async getPublishedPodcasts() {
    return this.podcastRepo.getPublishedPodcasts();
  }

  async getPodcastById(id: number) {
    const podcast = await this.podcastRepo.getPodcastById(id);

    if (!podcast)
      throw new NotFoundException({ message: "Podcast Not found." });

    return podcast;
  }

  async checkPodcastById(id: number) {
    return this.podcastRepo.checkPodcastById(id);
  }

  async createPodcast(data: CreatePodcastDto) {
    const podcastExist = await this.podcastRepo.checkPodcastByTitle(data.title);

    if (podcastExist)
      throw new BadRequestException({ message: "Podcast Already exist" });

    console.log({ data });

    return this.podcastRepo.createPodcast(data);
  }

  async updatePodcast(data: UpdatePodcastDto) {
    const { id, ...rest } = data;

    const podcastExist = await this.podcastRepo.checkPodcastById(id);

    if (!podcastExist)
      throw new NotFoundException({ message: "No podcast found with this id" });

    if (data.title) {
      const sameTitleExist = await this.podcastRepo.checkPodcastByTitle(
        data.title,
      );

      if (sameTitleExist)
        throw new BadRequestException({
          message: "A podcast with the same title already exist",
        });
    }

    const [affectedRows] = await this.podcastRepo.updatePodcast(id, rest);

    return { updated: !!affectedRows };
  }

  async publishPodcast(id: number) {
    const podcast = await this.podcastRepo.getPodcastForPublish(id);

    if (!podcast)
      throw new NotFoundException({
        message: "No Podcast was found with this id",
      });

    if (podcast.isPublished)
      throw new BadRequestException({
        message: `Podcast is already published at ${podcast.publishedAt.toString()}`,
      });

    if (!podcast.episodes.length)
      throw new BadRequestException({
        message: "This podcast does not have any published episodes",
      });

    await this.podcastRepo.updatePodcast(id, {
      isPublished: true,
      publishedAt: new Date(),
    });

    await this.indexPodcast(podcast);

    return { publised: true };
  }

  async searchPodcasts(query: Record<string, any>) {
    const result = await this.esService.search<PodcastAttr & EpisodeAttr>({
      index: [this.elasticsearchIndex, "episodes"],
      query,
    });

    const hits = result.hits.hits;

    const ids = hits.map(
      (hit) =>
        (hit?._source?.podcastId as number) || (hit?._source?.id as number),
    );

    const podcasts = await this.podcastRepo.findPodcastsById(ids);

    return podcasts;
  }

  private async indexPodcast(data: PodcastAttr) {
    const exists = await this.esService.exists({
      index: this.elasticsearchIndex,
      id: `${data.id}`,
    });

    if (exists) return;

    const podcast = await this.esService.index({
      id: `${data.id}`,
      index: this.elasticsearchIndex,
      document: {
        id: data.id,
        title: data.title,
        descriptions: data.descriptions,
        searchKeywords: data.searchKeywords,
      },
    });

    console.log({ podcast });
  }
}
