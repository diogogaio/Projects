import { Box, Typography } from "@mui/material";

export const ActualDate = () => {
  return (
    <Box mt={1}>
      <Typography
        variant="captionSMI"
        sx={{
          mt: 1,
          alignSelf: "center",
        }}
      >
        Data de hoje:{" "}
        <time>
          {new Date().toLocaleString("default", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </Typography>
    </Box>
  );
};
