export const setOrigin = () => {
  return process.env.NODE_ENV === "production"
    ? "https://equilibriofinanceiro.web.app"
    : "http://localhost:5173";
};
