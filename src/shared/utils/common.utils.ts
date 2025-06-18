export const getFilePath = (file: Express.Multer.File) => {
  const split = file.originalname.split(".");

  return file.path + "." + split[split.length - 1];
};
