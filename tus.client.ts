import { readFile } from "fs/promises";
import * as tus from "tus-js-client";

async function test() {
  const file = await readFile(
    "./uploads/videos/1750262552443-vecteezy_small-sea-wave-with-black-sand-calm-and-relax-vibes-take_23622815.mp4",
  );

  const upload = new tus.Upload(file, {
    endpoint: "http://localhost:3000/files/",
    metadata: {
      filename: "video.mp4",
      filetype: "video/mp4",
      episodeId: "3",
      podcastId: "1",
    },

    onError: function (error) {
      console.log(error);
    },

    onProgress: function (bytesUploaded, bytesTotal) {
      const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      console.log(bytesUploaded, bytesTotal, percentage + "%");
    },

    onSuccess: function () {
      console.log(`Successfully Upload file: ${upload.url}`);
    },
  });

  upload.start();
}

test().then(console.log).catch(console.error);
