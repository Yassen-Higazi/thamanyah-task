import { ElasticsearchModuleOptions } from "@nestjs/elasticsearch";

import {
  ELASTICSEARCH_HOST,
  ELASTICSEARCH_PORT,
  ELASTICSEARCH_PASSWORD,
  ELASTICSEARCH_USERNAME,
} from "./constants.config";

export const elasticsearchOptions: ElasticsearchModuleOptions = {
  node: `http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}`,
  auth: {
    username: ELASTICSEARCH_USERNAME as string,
    password: ELASTICSEARCH_PASSWORD as string,
  },
};
