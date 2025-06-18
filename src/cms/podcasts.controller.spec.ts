import { Test, TestingModule } from "@nestjs/testing";
import { PodcastsService } from "./services/podcasts.service";
import { PodcastsController } from "./controllers/podcasts.controller";

describe("PodcastsController", () => {
  let controller: PodcastsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PodcastsController],
      providers: [PodcastsService],
    }).compile();

    controller = module.get<PodcastsController>(PodcastsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
