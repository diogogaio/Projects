import { useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";

import {
  useThemeContext,
  useGlobalContext,
  useServerContext,
} from "../contexts";
import { useDebounce } from "../hooks";

type TReadingNotesProps = {
  readingId: string | undefined;
  initialNotes: string | undefined;
};

const ReadingNotes = ({ initialNotes }: TReadingNotesProps) => {
  const [readingNotes, setReadingNotes] = useState<string | undefined>(
    undefined
  );
  const { debounce } = useDebounce(1000);
  const { AppThemes } = useThemeContext();
  const { serverLoading } = useServerContext();
  const { setSelectedReading } = useGlobalContext();

  useEffect(() => {
    setReadingNotes(initialNotes || "");
  }, [initialNotes]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    setReadingNotes(value);
    debounce(() => setSelectedReading((prev) => ({ ...prev, notes: value })));
  };

  return (
    <Box boxShadow={AppThemes.themeShadows} width="95%" alignSelf="center">
      <TextField
        rows={4}
        fullWidth
        multiline
        id="reading-notes"
        value={readingNotes}
        name="reading-notes"
        disabled={serverLoading}
        placeholder="Conclusões, observações e anotações da leitura."
        onChange={(event) => handleInputChange(event)}
        inputProps={{
          maxLength: 2000,
        }}
      />
    </Box>
  );
};

export default ReadingNotes;
