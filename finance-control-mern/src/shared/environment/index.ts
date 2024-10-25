import { indigo } from "@mui/material/colors";

type TEnvironment = {
  ENV: "development" | "production";
  ADMIN_USER_EMAIL: string;
  PER_PAGE_LISTING: string;
  PRODUCTION_BASE_URL: string;
  DEVELOPMENT_BASE_URL: string;
  APP_MAIN_TEXT_COLOR: string;
  BUTTON_VARIANT: "contained" | "outlined";
};

export const Environment: TEnvironment = {
  ENV: import.meta.env.MODE === "production" ? "production" : "development",

  // Max quantity of lines at savedReadingList.tsx:
  PER_PAGE_LISTING: "10",

  PRODUCTION_BASE_URL: import.meta.env.PRODUCTION_BASE_URL,

  DEVELOPMENT_BASE_URL: import.meta.env.DEVELOPMENT_BASE_URL,

  //Privileged user admin:
  ADMIN_USER_EMAIL: "diogogaio@gmail.com",

  //For headings, buttons and subheadings mostly
  APP_MAIN_TEXT_COLOR: indigo[400],

  BUTTON_VARIANT: "outlined",
};
