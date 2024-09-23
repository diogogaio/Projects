export const setOrigin = () => {
  console.log(process.env.NODE_ENV);

  return process.env.NODE_ENV === "production"
    ? "https://equilibriofinanceiro.web.app"
    : "http://localhost:5173";
};
