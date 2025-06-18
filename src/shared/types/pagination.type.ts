import { Type, applyDecorators } from "@nestjs/common";
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from "@nestjs/swagger";

export type Pagination = {
  pageSize: number;
  pageNumber: number;
  limit: number;
  offset: number;
};

class PaginationInfoDto {
  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  pageNumber: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty({ nullable: true })
  nextPage: number | null;

  @ApiProperty({ nullable: true })
  previousPage: number | null;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  rows: T[];

  @ApiProperty()
  count: number;

  @ApiProperty({ type: PaginationInfoDto })
  pagination: PaginationInfoDto;
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginationInfoDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              rows: {
                type: "array",
                items: { $ref: getSchemaPath(model) },
              },

              count: { type: "number", example: 3 },

              pagination: { $ref: getSchemaPath(PaginationInfoDto) },
            },
          },
        ],
      },
    }),
  );
};
