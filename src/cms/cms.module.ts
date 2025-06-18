import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { SequelizeModule } from "@nestjs/sequelize";
import { BullBoardModule } from "@bull-board/nestjs";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

import { VideoModel } from "./models/video.model";
import { PodcastModel } from "./models/podcast.model";
import { EpisodeModel } from "./models/episode.model";

import { TusService } from "./services/tus.service";
import { VideoTranscoder } from "./video.processer";
import { PodcastsService } from "./services/podcasts.service";
import { EpisodesService } from "./services/episodes.service";

import { PodcastsController } from "./controllers/podcasts.controller";
import { EpisodesController } from "./controllers/episodes.controller";
import { FileUploadController } from "./controllers/file-upload.controller";

import { FfmpegHelper } from "src/shared/helpers/ffmpeg.helper";
import { VideosRepository } from "./repositories/videos.repostory";
import { PodcastsRepository } from "./repositories/podcast.repository";
import { EpisodesRepository } from "./repositories/episodes.repository";
import { elasticsearchOptions } from "src/configs/elasticsearch.config";

@Module({
  providers: [
    TusService,
    PodcastsService,
    EpisodesService,
    VideosRepository,
    PodcastsRepository,
    EpisodesRepository,
    FfmpegHelper,
    VideoTranscoder,
  ],
  exports: [PodcastsService, EpisodesService],
  controllers: [PodcastsController, EpisodesController, FileUploadController],
  imports: [
    SequelizeModule,
    EventEmitterModule.forRoot(),
    ElasticsearchModule.register(elasticsearchOptions),
    SequelizeModule.forFeature([PodcastModel, EpisodeModel, VideoModel]),
    BullModule.registerQueue({
      name: "transcode",
    }),
    BullBoardModule.forFeature({
      name: "transcode",
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
  ],
})
export class CmsModule {}
