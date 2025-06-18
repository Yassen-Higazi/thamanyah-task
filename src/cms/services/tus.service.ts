/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { extname } from "node:path";
import { Request, Response } from "express";
import { FileStore } from "@tus/file-store";
import { EVENTS, Server, Upload } from "@tus/server";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class TusService implements OnModuleInit {
  private tusServer: Server;

  constructor(private readonly eventEmitter: EventEmitter2) {}

  onModuleInit() {
    // TODO: Make better folder structure and filenames (./uploads/episodes/:episodeId/:filename)
    this.tusServer = new Server({
      path: "/files",
      datastore: new FileStore({ directory: "./uploads/podcasts" }),

      namingFunction(_: Request, metadata) {
        const filename = metadata?.filename;
        const podcastId = metadata?.podcastId;
        const episodeId = metadata?.episodeId;

        if (!podcastId || !episodeId) {
          throw new Error("Missing podcastId or episodeId in metadata");
        }

        // static name for the file under this structure
        return `${podcastId}/${episodeId}/${filename}`;
      },

      // Encodes the file ID into a URL-safe format
      generateUrl(_, { proto, host, path, id }) {
        const encoded = Buffer.from(id, "utf-8").toString("base64url");

        return `${proto}://${host}${path}/${encoded}`;
      },

      // Decodes the ID back from the URL
      getFileIdFromRequest(_, lastPath) {
        return Buffer.from(lastPath as string, "base64url").toString("utf-8");
      },
    });

    this.tusServer.on(EVENTS.POST_CREATE, this.onUploadCreate.bind(this));
    this.tusServer.on(EVENTS.POST_FINISH, this.onUploadFinish.bind(this));
  }

  private async onUploadCreate(_: Request, upload: Upload) {
    // TODO: sanatize filename
    const filename = upload.metadata?.filename as string;

    if (!filename) throw new Error("filename is required");

    const episodeId = upload.metadata?.episodeId as string;

    if (!episodeId) throw new Error("episodeId is reqyired");

    return { ...upload, metadata: { ...upload.metadata } };
  }

  private async onUploadFinish(req: Request, res: Response, upload: Upload) {
    this.eventEmitter.emit("file.uploaded", {
      size: upload.size,
      path: upload.storage?.path,
      filetype: upload.metadata?.filetype,
      episodeId: upload.metadata?.episodeId,
      originalFilename: upload.metadata?.filename,
      extention: extname(upload.metadata?.filename as string),
    });
  }

  async handleUpload(req: Request, res: Response) {
    return this.tusServer.handle(req, res);
  }
}
