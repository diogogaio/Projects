export {};
// module augmentation
// https://www.youtube.com/watch?v=USi8khln7YI

declare module "@mui/material/styles" {
  interface TypographyVariants {
    captionXS: React.CSSProperties;
    captionSMI: React.CSSProperties;
    buttonSM: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    captionXS?: React.CSSProperties;
    captionSMI?: React.CSSProperties;
    buttonSM?: React.CSSProperties;
  }

  interface Theme {
    LightShadow: string;
  }

  interface ThemeOptions {
    LightShadow: string;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    captionXS: true;
    captionSMI: true;
    buttonSM: true;
  }
}
