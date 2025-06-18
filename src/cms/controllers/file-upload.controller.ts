import {
  All,
  Controller,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from "@nestjs/common";
import { TusService } from "../services/tus.service";
import { ApiExcludeController } from "@nestjs/swagger";
import { Public } from "src/shared/decorators/auth.decorator";

@ApiExcludeController()
@Controller("/files")
export class FileUploadController {
  constructor(private readonly tusService: TusService) {}

  @Public()
  @All("*/")
  @HttpCode(HttpStatus.OK)
  async handleFileUpload(@Req() req, @Res() res) {
    return this.tusService.handleUpload(req, res);
  }
}
