import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiOkResponse } from "@nestjs/swagger";

import { AuthGuard } from "src/auth/auth.guard";
import { PodcastAttr } from "../models/podcast.model";
import { EpisodeAttr } from "../models/episode.model";
import { UserRole } from "src/shared/types/roles.type";
import { Role } from "src/shared/decorators/auth.decorator";
import { PodcastsService } from "../services/podcasts.service";
import { ApiPaginatedResponse } from "src/shared/types/pagination.type";
import { defaultImageStorage } from "src/shared/utils/fileUpload.utils";
import { EpisodesRepository } from "../repositories/episodes.repository";
import { CreatePodcastDto, UpdatePodcastDto } from "../dtos/podcasts.dto";
import { TransactionsInterceptor } from "src/shared/interceptors/transaction.interceptor";
import { PaginationInterceptor } from "src/shared/interceptors/pagination.interceptor";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Role(UserRole.ADMIN)
@Controller("podcasts")
@UseInterceptors(TransactionsInterceptor)
export class PodcastsController {
  constructor(
    private readonly podcastsService: PodcastsService,
    private readonly episodesService: EpisodesRepository,
  ) {}

  @Get("/")
  @ApiPaginatedResponse(PodcastAttr)
  @UseInterceptors(PaginationInterceptor)
  async getAllPodcasts() {
    return this.podcastsService.getAllPodcast();
  }

  @Get("/:id")
  @ApiOkResponse({
    type: PodcastAttr,
    description: "Retrive Podcast details by id",
  })
  async getPodcastById(@Param("id", ParseIntPipe) id: number) {
    return this.podcastsService.getPodcastById(id);
  }

  @Post("/")
  @ApiConsumes("multipart/form-data")
  @ApiOkResponse({ type: PodcastAttr, description: "Created a new Podcast" })
  @UseInterceptors(
    FileInterceptor("thumbnail", { storage: defaultImageStorage }),
  )
  async createPodcast(
    @Body() data: CreatePodcastDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file);

    if (file) data.thumbnail = file.path;

    return this.podcastsService.createPodcast(data);
  }

  @Put("/")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("thumbnail", { storage: defaultImageStorage }),
  )
  @ApiOkResponse({
    description: "Update podcast details and returns updated true or false",
    example: { update: true },
  })
  async updatePodcast(
    @Body() data: UpdatePodcastDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) data.thumbnail = file.path;

    return this.podcastsService.updatePodcast(data);
  }

  @Get("/:podcastId/episodes")
  @ApiPaginatedResponse(EpisodeAttr)
  @UseInterceptors(PaginationInterceptor)
  async getAllEpisodes(@Param("podcastId", ParseIntPipe) podcastId: number) {
    return this.episodesService.getPodcastEpisodes(podcastId);
  }

  @Post("/:podcastId/publish")
  @ApiOkResponse({
    description: "Publish Podcast",
    example: { published: true },
  })
  async publishPodcast(@Param("podcastId", ParseIntPipe) id: number) {
    return this.podcastsService.publishPodcast(id);
  }
}
