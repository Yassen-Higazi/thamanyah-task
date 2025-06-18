import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Queue } from "bullmq";
import { join, extname } from "node:path";
import { InjectQueue } from "@nestjs/bullmq";
import { mkdir, writeFile } from "node:fs/promises";
import { ElasticsearchService } from "@nestjs/elasticsearch";

import { PodcastsService } from "./podcasts.service";
import { EpisodeAttr } from "../models/episode.model";
import { FfmpegHelper } from "src/shared/helpers/ffmpeg.helper";
import { VideosRepository } from "../repositories/videos.repostory";
import { EpisodesRepository } from "../repositories/episodes.repository";
import { CreateEpisodeDto, UpdateEpisodeDto } from "../dtos/episodes.dto";

@Injectable()
export class EpisodesService {
  readonly elasticSearchIndex = "episodes";

  constructor(
    private readonly ffmpegHelper: FfmpegHelper,
    private readonly videoRepo: VideosRepository,
    private readonly podcastService: PodcastsService,
    private readonly episodeRepo: EpisodesRepository,
    private readonly esService: ElasticsearchService,
    @InjectQueue("transcode") private readonly transcodeQueue: Queue,
  ) {}

  async getEpisodeById(id: number) {
    const episode = await this.episodeRepo.getEpisodeById(id);

    if (!episode) throw new NotFoundException({ message: "Episode not found" });

    return episode;
  }

  async createEpisode(data: CreateEpisodeDto) {
    const episodeExist = await this.episodeRepo.checkEpisodeByTitle(data.title);

    if (episodeExist)
      throw new BadRequestException({ message: "Episode Already exist" });

    console.log({ data });

    const podcastExist = await this.podcastService.checkPodcastById(
      data.podcastId,
    );

    if (!podcastExist)
      throw new NotFoundException({
        message: "Could not find any podcast with this id",
      });

    return this.episodeRepo.createEpisode(data);
  }

  async updateEpisode(data: UpdateEpisodeDto) {
    const { id, ...rest } = data;

    const episodeExist = await this.episodeRepo.checkEpisodeById(id);

    if (!episodeExist)
      throw new NotFoundException({ message: "No episode found with this id" });

    if (data.title) {
      const sameTitleExist = await this.episodeRepo.checkEpisodeByTitle(
        data.title,
      );

      if (sameTitleExist)
        throw new BadRequestException({
          message: "A episode with the same title already exist",
        });
    }

    const [affectedRows] = await this.episodeRepo.updateEpisode(id, rest);

    return { updated: !!affectedRows };
  }

  async getPodcastEpisodes(podcastId: number) {
    return this.episodeRepo.getPodcastEpisodes(podcastId);
  }

  async createVideo(videoFile: Express.Multer.File) {
    if (!videoFile.destination) {
      await mkdir(join(videoFile.path, ".."), { recursive: true });

      await writeFile(videoFile.path, videoFile.buffer);
    }

    const video = await this.videoRepo.createVideo({
      filename: videoFile.filename,
      manifestPath: videoFile.path,
      duration: await this.ffmpegHelper.getDuration(videoFile.path),
      extention: extname(videoFile.filename || videoFile.originalname),
    });

    return video;
  }

  async uploadEpisodeVido(id: number, videoFile: Express.Multer.File) {
    const episode = await this.episodeRepo.getEpisode(id);

    if (!episode)
      throw new NotFoundException({
        message: "No Episode was found with this id",
      });

    if (episode.isPublished)
      throw new BadRequestException({
        message: "You can not upload a video to a published Episode",
      });

    if (!videoFile.path)
      videoFile.path = join(
        "./uploads",
        "podcasts",
        `${episode.podcastId}`,
        `${episode.id}`,
        videoFile.originalname,
      );

    const video = await this.createVideo(videoFile);

    await this.episodeRepo.updateEpisode(id, { videoId: video.id as number });

    const outputDir = join(videoFile.path, "..");

    await Promise.all([
      this.transcodeQueue.add("transcode", {
        episodeId: id,
        output: outputDir,
        input: videoFile.path,
        fallbak: false,
      }),

      this.transcodeQueue.add("transcode", {
        episodeId: 1,
        input: videoFile.path,
        output: outputDir,
        fallbak: true,
      }),
    ]);

    return { uploaded: true };
  }

  async updateEpisodeVideo(episodeId: number, manifestPath: string) {
    const video = await this.videoRepo.checkVideoByEpisodeId(episodeId);

    if (!video) throw new NotFoundException("Video was not found");

    await this.videoRepo.updateVideo(video.id as number, { manifestPath });
  }

  async publishEpisode(id: number) {
    const episode = await this.episodeRepo.getEpisodeById(id);

    console.log({ episode: episode?.title });

    if (!episode)
      throw new NotFoundException({
        message: "No Episode was found with this id",
      });

    if (episode.isPublished)
      throw new BadRequestException({
        message: `Episode is already published at: ${episode.publishedAt.toString()}`,
      });

    if (!episode?.video)
      throw new BadRequestException({
        message: "This episode does not have a video yet.",
      });

    await this.episodeRepo.updateEpisode(id, {
      isPublished: true,
      publishedAt: new Date(),
    });

    await this.indexEpisode(episode);

    return { published: true };
  }

  async searchEpisodes(query: Record<string, any>) {
    const result = await this.esService.search<EpisodeAttr>({
      index: this.elasticSearchIndex,
      query,
    });

    const hits = result.hits.hits;

    console.log(hits);

    const ids = hits.map((hit) => hit?._source?.id as number);

    if (!ids.length) return [];

    const episodes = await this.episodeRepo.findEpisodesByIds(ids);

    return episodes;
  }

  async getPublishedEpisodes(podcastId: number) {
    return this.episodeRepo.getPublishedEpisode(podcastId);
  }

  private async indexEpisode(data: EpisodeAttr) {
    const exist = await this.esService.exists({
      id: `${data.id}`,
      index: this.elasticSearchIndex,
    });

    if (exist) return;

    const episode = await this.esService.index({
      id: `${data.id}`,
      index: this.elasticSearchIndex,
      document: {
        id: data.id,
        title: data.title,
        guests: data.guests,
        catefory: data.category,
        podcastId: data.podcastId,
        presenter: data.presenter,
        descriptions: data.descriptions,
        searchKeywords: data.searchKeywords,
      },
    });

    console.log(episode);
  }
}
