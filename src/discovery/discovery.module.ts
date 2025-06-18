import { Module } from "@nestjs/common";

import { DiscoveryService } from "./discovery.service";
import { DiscoveryController } from "./discovery.controller";
import { CmsModule } from "src/cms/cms.module";

@Module({
  imports: [CmsModule],
  providers: [DiscoveryService],
  controllers: [DiscoveryController],
})
export class DiscoveryModule {}
