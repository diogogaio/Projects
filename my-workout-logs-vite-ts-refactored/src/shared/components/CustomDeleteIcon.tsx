import { Link, Typography, Stack } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/Delete";

type TCustomDeleteIcon = {
  text?: string;
  deleteFn: () => void | Promise<void>;
};

export const CustomDeleteIcon = ({ text, deleteFn }: TCustomDeleteIcon) => {
  return (
    <Link
      underline="hover"
      sx={{
        color: "red",
        cursor: "pointer",
        marginRight: "3px",
        textDecoration: "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        deleteFn();
      }}
    >
      {" "}
      <Stack direction="row">
        <DeleteForeverRoundedIcon sx={{ fontSize: "0.9rem" }} />
        {text && <Typography variant="buttonSM">{text}</Typography>}
      </Stack>
    </Link>
  );
};
