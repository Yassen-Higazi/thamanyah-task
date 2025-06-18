import { Test, TestingModule } from "@nestjs/testing";
import { PodcastsService } from "./services/podcasts.service";

describe("CmsService", () => {
  let service: PodcastsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PodcastsService],
    }).compile();

    service = module.get<PodcastsService>(PodcastsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
