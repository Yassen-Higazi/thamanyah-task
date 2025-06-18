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
import { OnEvent } from "@nestjs/event-emitter";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
} from "@nestjs/swagger";

import {
  defaultImageStorage,
  defaultVideoStorage,
} from "src/shared/utils/fileUpload.utils";
import {
  CreateEpisodeDto,
  UpdateEpisodeDto,
  UploadeEpisodeVideo as UploadeEpisodeVideoDto,
  UPloadTusEpisodeVideo as UploadTusEpisodeVideo,
} from "../dtos/episodes.dto";

import { EpisodeAttr } from "../models/episode.model";
import { EpisodesService } from "../services/episodes.service";

import { AuthGuard } from "src/auth/auth.guard";
import { UserRole } from "src/shared/types/roles.type";
import { Role } from "src/shared/decorators/auth.decorator";
import { TransactionsInterceptor } from "src/shared/interceptors/transaction.interceptor";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Role(UserRole.ADMIN)
@Controller("episodes")
@UseInterceptors(TransactionsInterceptor)
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get("/:id")
  @ApiOkResponse({
    type: EpisodeAttr,
    description: "Retrive Episode details by id",
  })
  async getEpisodeById(@Param("id", ParseIntPipe) id: number) {
    return this.episodesService.getEpisodeById(id);
  }

  @Post("/")
  @ApiConsumes("multipart/form-data")
  @ApiOkResponse({ type: EpisodeAttr, description: "Created a new Episode" })
  @UseInterceptors(
    FileInterceptor("thumbnail", { storage: defaultImageStorage }),
  )
  async createEpisode(
    @Body() data: CreateEpisodeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file);

    if (file) data.thumbnail = file.path;

    return this.episodesService.createEpisode(data);
  }

  @Put("/")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("thumbnail", { storage: defaultImageStorage }),
  )
  @ApiOkResponse({
    description: "Update episode details and returns updated true or false",
    example: { update: true },
  })
  async updateEpisode(
    @Body() data: UpdateEpisodeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) data.thumbnail = file.path;

    return this.episodesService.updateEpisode(data);
  }

  @Put("/:id/uploadVideo")
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UploadeEpisodeVideoDto })
  @UseInterceptors(
    FileInterceptor("videoFile", { storage: defaultVideoStorage }),
  )
  @ApiOkResponse({
    description: "Upload episode video",
    example: { uploaded: true },
  })
  async uploadEpisodeVideo(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() videoFile: Express.Multer.File,
  ) {
    return this.episodesService.uploadEpisodeVido(id, videoFile);
  }

  @Post("/:id/publish")
  @ApiOkResponse({
    description: "publish Episode",
    example: { published: true },
  })
  async publishEpisode(@Param("id", ParseIntPipe) id: number) {
    return this.episodesService.publishEpisode(id);
  }

  @OnEvent("file.uploaded")
  async finleUploaded(data: UploadTusEpisodeVideo) {
    return this.episodesService.uploadEpisodeVido(+data.episodeId, {
      encoding: "",
      path: data.path,
      size: data.size,
      destination: data.path,
      mimetype: data.filetype,
      filename: data.originalFilename,
      fieldname: data.originalFilename,
      originalname: data.originalFilename,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      stream: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      buffer: {} as any,
    });
  }

  @OnEvent("video.transcoding.completed")
  async videoTranscodingCompleted(data: {
    manifestPath: string;
    episodeId: number;
  }) {
    return this.episodesService.updateEpisodeVideo(
      data.episodeId,
      data.manifestPath,
    );
  }
}
