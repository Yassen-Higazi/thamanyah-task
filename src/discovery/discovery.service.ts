import { Injectable } from "@nestjs/common";
import { EpisodesService } from "src/cms/services/episodes.service";
import { PodcastsService } from "src/cms/services/podcasts.service";

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly podcastsService: PodcastsService,
    private readonly episodesService: EpisodesService,
  ) {}

  async getPublishedEpisodes(podcastId: number) {
    return this.episodesService.getPublishedEpisodes(podcastId);
  }

  async getPublishedPodcasts() {
    return this.podcastsService.getPublishedPodcasts();
  }

  async searchPodcasts(searchTerm: string) {
    return this.podcastsService.searchPodcasts({
      bool: {
        should: [
          // Podcast Search
          {
            multi_match: {
              query: searchTerm,
              fields: ["title^3", "description^2", "searchKeywords"],
              type: "best_fields", // Prioritize fields with better matches
              fuzziness: "AUTO", // Optional: for typo tolerance
            },
          },

          // Episode Search
          {
            multi_match: {
              query: searchTerm,
              fields: [
                "title^4",
                "description^3",
                "searchKeywords^2",
                "presenter^2",
                "guests^2",
                "category",
              ],
              type: "best_fields",
              fuzziness: "AUTO",
            },
          },
        ],
        minimum_should_match: 1, // At least one 'should' clause must match
      },
    });
  }

  async searchEpisodes(searchTerm: string) {
    return this.episodesService.searchEpisodes({
      bool: {
        should: [
          // Episode Search
          {
            multi_match: {
              query: searchTerm,
              fields: [
                "title^4",
                "description^3",
                "searchKeywords^2",
                "presenter^2",
                "guests^2",
                "category",
              ],
              type: "best_fields",
              fuzziness: "AUTO",
            },
          },
          // You can add more specific queries here if needed, e.g.,
          // { term: { 'category.keyword': query } }, // For exact category match
        ],
        minimum_should_match: 1, // At least one 'should' clause must match
      },
    });
  }
}
