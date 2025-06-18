import { Table, Model } from "sequelize-typescript";

@Table({
  paranoid: true,
  timestamps: true,
  underscored: true,
  defaultScope: { attributes: { exclude: ["deletedAt"] } },
})
export class BaseModel<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  ModelAttr extends {} = any,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  CreationAttr extends {} = any,
> extends Model<ModelAttr, CreationAttr> {}
