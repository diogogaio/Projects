type TEnvironment = {
  ADMIN_USER_TAG: string;
  MAX_SERVER_READINGS: number;
  MAX_READINGS_LISTING: number;
  APP_MAIN_TEXT_COLOR: "secondary";
  SERVER_REQUESTS_INTERVAL: number;
  SAVE_READINGS_LIMIT_ALERT: number;
};

export const Environment: TEnvironment = {
  // Max quantity of lines at savedReadingList.tsx:
  MAX_READINGS_LISTING: 15,
  // Max server stored readings due to Firestore quota:
  MAX_SERVER_READINGS: 100,

  //Number of save readings on server left to trigger alerts:
  SAVE_READINGS_LIMIT_ALERT: 10,

  //Minutes until user is allowed to fetch all readings from Firestore again:
  SERVER_REQUESTS_INTERVAL: 180,

  //Privileged user admin:
  ADMIN_USER_TAG: "TarotReadingstjUnJ1KAJgc9MHbqzor5PqQiOJX2",

  //For headings and subheadings mostly
  APP_MAIN_TEXT_COLOR: "secondary",
};
