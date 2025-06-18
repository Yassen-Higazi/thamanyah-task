import {
  Get,
  Param,
  Query,
  Controller,
  ParseIntPipe,
  UseInterceptors,
} from "@nestjs/common";

import { DiscoveryService } from "./discovery.service";
import { PodcastAttr } from "src/cms/models/podcast.model";
import { Public } from "src/shared/decorators/auth.decorator";
import { searchEpisodesDto, SearchPodcastsDto } from "./search.dto";
import { ApiPaginatedResponse } from "src/shared/types/pagination.type";
import { TransactionsInterceptor } from "src/shared/interceptors/transaction.interceptor";
import { PaginationInterceptor } from "src/shared/interceptors/pagination.interceptor";
import { EpisodeAttr } from "src/cms/models/episode.model";

@Public()
@Controller("discovery")
@UseInterceptors(TransactionsInterceptor)
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get("/search/podcasts")
  @ApiPaginatedResponse(PodcastAttr)
  @UseInterceptors(PaginationInterceptor)
  async searchPodcasts(@Query() data: SearchPodcastsDto) {
    return this.discoveryService.searchPodcasts(data.searchTerm);
  }

  @Get("/search/episodes")
  @ApiPaginatedResponse(EpisodeAttr)
  @UseInterceptors(PaginationInterceptor)
  async searchEpisodes(@Query() data: searchEpisodesDto) {
    return this.discoveryService.searchEpisodes(data.searchTerm);
  }

  @Get("podcasts")
  @ApiPaginatedResponse(PodcastAttr)
  @UseInterceptors(PaginationInterceptor)
  async getPublishedPodcasts() {
    return this.discoveryService.getPublishedPodcasts();
  }

  @Get("podcasts/:podcastId/episodes")
  @ApiPaginatedResponse(EpisodeAttr)
  @UseInterceptors(PaginationInterceptor)
  async getPublishedEpisodes(
    @Param("podcastId", ParseIntPipe) podcastId: number,
  ) {
    return this.discoveryService.getPublishedEpisodes(podcastId);
  }
}
