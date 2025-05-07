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

const ReadingNotes = ({ initialNotes, readingId }: TReadingNotesProps) => {
  const [readingNotes, setReadingNotes] = useState<string | undefined>(
    undefined
  );

  const { debounce } = useDebounce(1000);
  const { AppThemes } = useThemeContext();
  const { serverLoading } = useServerContext();
  const { setSelectedReading } = useGlobalContext();

  useEffect(() => {
    if (initialNotes) {
      setReadingNotes(initialNotes);
    }
  }, [initialNotes]);

  useEffect(() => {
    if (readingNotes !== undefined) {
      debounce(handleReadingNotes);
    }
  }, [readingNotes]);

  const handleReadingNotes = () => {
    if (!readingId || !readingNotes) return;
    setSelectedReading((prev) => ({ ...prev, notes: readingNotes }));
  };

  return (
    <Box boxShadow={AppThemes.themeShadows} width="95%" alignSelf="center">
      <TextField
        rows={4}
        fullWidth
        multiline
        id="reading-notes"
        name="reading-notes"
        disabled={serverLoading}
        defaultValue={readingNotes}
        placeholder="Conclusões, observações e anotações da leitura."
        onChange={(event) => setReadingNotes(event.target.value)}
        inputProps={{
          maxLength: 2000,
        }}
      />
    </Box>
  );
};

export default ReadingNotes;
