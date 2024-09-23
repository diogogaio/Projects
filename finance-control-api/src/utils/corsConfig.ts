export const setOrigin = () => {
  return process.env.NODE_ENV === "production"
    ? process.env.PRODUCTION_BASE_URL
    : process.env.DEVELOPMENT_BASE_URL;
};
