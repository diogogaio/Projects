import { indigo } from "@mui/material/colors";

type TEnvironment = {
  ADMIN_USER_EMAIL: string;
  PER_PAGE_LISTING: string;
  APP_MAIN_TEXT_COLOR: string;
  BUTTON_VARIANT: "contained" | "outlined";
};

export const Environment: TEnvironment = {
  // Max quantity of lines at savedReadingList.tsx:
  PER_PAGE_LISTING: "10",

  //Privileged user admin:
  ADMIN_USER_EMAIL: "diogogaio@gmail.com",

  //For headings, buttons and subheadings mostly
  APP_MAIN_TEXT_COLOR: indigo[400],

  BUTTON_VARIANT: "outlined",
};
