/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { join } from "path";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { spawn } from "child_process";
import { Injectable } from "@nestjs/common";
import { mkdir, writeFile } from "node:fs/promises";

export interface FfprobeStream {
  index: number;
  codec_name: string;
  width?: number;
  height?: number;
  duration?: string;
  bit_rate?: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  codec_type: "video" | "audio" | "subtitle" | string;
  [key: string]: any;
}

export interface FfprobeFormat {
  filename: string;
  nb_streams: number;
  duration: number;
  bit_rate: string;
  size: string;
  format_name: string;
  [key: string]: any;
}

export interface FfprobeData {
  format: FfprobeFormat;
  streams: FfprobeStream[] | undefined;
}

export type Rendition = [
  width: number,
  height: number,
  videoBitrate: number,
  audioBitrate: number,
  maxBitrate: number,
  bufferSize: number,
];

export type FfmpegProgress = {
  frames: number;
  currentFps: number;
  targetSize: number;
  currentKbps: number;
  speed: string;
  timemark: string;
  timemarkSec: number;
};

export type FfmpegProccessOptions = {
  onError?: (error: Error) => any;

  onProgress?: (progress: FfmpegProgress) => any;

  onEnd?: (masterManifestPath: string) => any;
};

@Injectable()
export class FfmpegHelper {
  // sizes (resolutions) [width, height, videoBitrate, audioBitrate, maxBitrate, bufferSize]
  private readonly defaultRenditions: Rendition[] = [
    [640, 360, 800, 96, 825, 1200],
    [854, 480, 1400, 128, 1498, 2100],
    [1280, 720, 4000, 192, 5350, 7500],
  ];

  private readonly fallbackRendition: Rendition = [
    854, 480, 1200, 128, 1498, 2100,
  ];

  private readonly defaultOptions: FfmpegProccessOptions = {
    onError: (err: Error) => {
      console.error(err);

      throw err;
    },

    onProgress: (proggress) => console.log({ proggress }),

    onEnd: console.log,
  };

  async getDuration(input: string) {
    const info = await this.getMediaInfo(input);

    return Promise.resolve(info.format?.duration);
  }

  async generateFallback(
    input: string,
    outputDir: string,
    options = this.defaultOptions,
    rendition: Rendition = this.fallbackRendition,
  ) {
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }
    const [width, height, videoBitrate, audioBitrate] = rendition;

    const outputPath = resolve(outputDir, "fallback.mp4");

    const commandArgs: string[] = [
      "-i",
      input,
      "-vf",
      `scale=${width}:${height}`,
      "-c:v",
      "libx264",
      "-b:v",
      `${videoBitrate}k`,
      "-preset",
      "veryfast",
      "-movflags",
      "+faststart",
      "-keyint_min",
      "60",
      "-refs",
      "5",
      "-g",
      "60",
      "-pix_fmt",
      "yuv420p",
      "-sc_threshold",
      "0",
      "-profile:v",
      "main",
      "-c:a",
      "aac",
      "-ac",
      "2",
      "-ar",
      "44100",
      "-b:a",
      `${audioBitrate}k`,
      outputPath,
    ];

    await this.runFFmpeg(commandArgs, input, options);

    console.log(`Fallback verion generated at: ${outputDir}`);
  }

  async hls(
    input: string,
    outputDir: string,
    options = this.defaultOptions,
    renditions: Rendition[] = this.defaultRenditions,
  ): Promise<void> {
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    const [commandArgs, manifest] = this.generateArgs(
      input,
      outputDir,
      renditions,
    );

    const masterManifestPath = join(outputDir, "manifest.m3u8");

    await Promise.all([
      writeFile(masterManifestPath, manifest),

      this.runFFmpeg(commandArgs, masterManifestPath, options),
    ]);

    console.log(`Master manifest written to ${masterManifestPath}`);
  }

  async getMediaInfo(input: string): Promise<FfprobeData> {
    return new Promise((resolve, reject) => {
      const args = [
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        input,
      ];

      const ffprobe = spawn("ffprobe", args);

      let output = "";
      let error = "";

      ffprobe.stdout.on("data", (data: Buffer) => {
        output += data.toString();
      });

      ffprobe.stderr.on("data", (data: Buffer) => {
        error += data.toString();
      });

      ffprobe.on("error", (err) => {
        reject(new Error(`Failed to start ffprobe: ${err.message}`));
      });

      ffprobe.on("close", (code) => {
        if (code !== 0 || error) {
          return reject(
            new Error(`ffprobe error: ${error || `Exit code ${code}`}`),
          );
        }

        try {
          const parsed = JSON.parse(output) as FfprobeData;
          resolve({
            ...parsed,
            format: {
              ...parsed.format,
              duration: Math.round(+parsed.format.duration),
            },
          });
        } catch (e) {
          reject(new Error(`Failed to parse ffprobe: ${e}`));
        }
      });
    });
  }

  private generateArgs(
    input: string,
    outputDir: string,
    renditions: Rendition[] = this.defaultRenditions,
    genManifest = true,
  ): [string[], string] {
    let masterManifest = genManifest ? `#EXTM3U\n#EXT-X-VERSION:3` : "";

    const commandArgs: string[][] = [];

    for (const [
      width,
      height,
      videoBitrate,
      audioBitrate,
      maxBitrate,
      bufferSize,
    ] of renditions) {
      const name = `${height}p`;
      const playlistPath = join(outputDir, `${name}.m3u8`);
      const segmentPath = join(outputDir, `${name}_%03d.ts`);

      if (genManifest)
        masterManifest += `\n#EXT-X-STREAM-INF:BANDWIDTH=${videoBitrate * 1000},RESOLUTION=${width}x${height}\n${name}.m3u8`;

      commandArgs.push([
        "-hide_banner",
        "-y",
        "-i",
        input,
        "-vf",
        `scale=w=${width}:h=${height}`,
        "-c:a",
        "aac",
        "-ar",
        "48000",
        "-b:a",
        `${audioBitrate}k`,
        "-c:v",
        "h264",
        "-profile:v",
        "main",
        "-sc_threshold",
        "0",
        "-g",
        "48",
        "-keyint_min",
        "48",
        "-b:v",
        `${videoBitrate}k`,
        "-maxrate",
        `${maxBitrate}k`,
        "-bufsize",
        `${bufferSize}k`,
        "-hls_time",
        "4",
        "-hls_playlist_type",
        "vod",
        "-hls_segment_filename",
        segmentPath,
        playlistPath,
      ]);
    }

    return [commandArgs.flat(), masterManifest];
  }

  private runFFmpeg(
    args: string[],
    manifestPath: string,
    options: FfmpegProccessOptions = this.defaultOptions,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", args);

      ffmpeg.stderr.on("data", (data: Buffer) => {
        const msg = data.toString();

        const progress = this.parseProgressLine(msg);

        if (progress) {
          if (options?.onProgress) options.onProgress(progress);
        }
      });

      ffmpeg.on("error", (err) => {
        if (options?.onError) options.onError(err);

        reject(new Error(`[${manifestPath}] FFmpeg error: ${err.message}`));
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          if (options?.onEnd) options.onEnd(manifestPath);

          resolve();
        } else {
          if (options?.onError)
            options.onError(
              new Error(`[${manifestPath}] FFmpeg exited with code ${code}`),
            );
        }
      });
    });
  }

  private parseProgressLine(line: string) {
    const progress = {} as Record<string, any>;

    // Remove all spaces after = and trim
    line = line.replace(/=\s+/g, "=").trim();

    const progressParts = line.split(" ");

    // Split every progress part by "=" to get key and value
    for (let i = 0; i < progressParts.length; i++) {
      const progressSplit = progressParts[i].split("=", 2);

      const key = progressSplit[0];

      const value = progressSplit[1];

      // This is not a progress line
      if (typeof value === "undefined") return null;

      progress[key] = value;
    }

    if (progress)
      return {
        speed: progress?.speed as string,
        timemark: progress?.time as string,
        frames: parseInt(progress.frame, 10),
        currentFps: parseInt(progress.fps, 10),
        targetSize: parseInt(progress.size || progress.Lsize, 10),
        timemarkSec: this.timeToSeconds(
          (progress?.time as string) || "00:00:00.0",
        ),
        currentKbps: progress.bitrate
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            parseFloat(progress?.bitrate?.replace?.("kbits/s", ""))
          : 0,
      } as FfmpegProgress;
  }

  private timeToSeconds(timeStr: string): number {
    const timeSplit = timeStr.split(":");

    if (timeSplit.length != 3) return -1;

    const [hours, minutes, seconds] = timeSplit;

    return Math.round(
      parseInt(hours, 10) * 3600 +
        parseInt(minutes, 10) * 60 +
        parseFloat(seconds),
    );
  }
}
