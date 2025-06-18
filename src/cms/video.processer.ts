import { Job } from "bullmq";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { FfmpegHelper, FfmpegProgress } from "src/shared/helpers/ffmpeg.helper";

@Processor("transcode")
export class VideoTranscoder extends WorkerHost {
  constructor(
    private readonly ffmpegHelper: FfmpegHelper,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(
    job: Job<
      { input: string; output: string; fallbak: boolean; episodeId: number },
      any
    >,
  ): Promise<any> {
    const duration = await this.ffmpegHelper.getDuration(job.data.input);

    if (job.data.fallbak) {
      await this.ffmpegHelper.generateFallback(
        job.data.input,
        job.data.output,
        {
          onProgress: (progress) =>
            this.updateProgress(job, duration, progress),
        },
      );
    } else {
      await this.ffmpegHelper.hls(job.data.input, job.data.output, {
        onProgress: (progress) => this.updateProgress(job, duration, progress),

        onError: async (error) => {
          console.log(error);

          await job.moveToFailed(error, job.token as string);
        },

        onEnd: (manifestPath: string) => {
          this.eventEmitter.emit("video.transcoding.completed", {
            manifestPath,
            episodeId: job.data.episodeId,
          });
        },
      });
    }

    return {};
  }

  private async updateProgress(
    job: Job<any>,
    mediaDuration: number,
    progress: FfmpegProgress,
  ) {
    const percentage = Math.round((progress.timemarkSec / mediaDuration) * 100);

    console.log(`Current Video progress is: ${percentage}%`);

    await job.updateProgress(percentage);
  }
}
