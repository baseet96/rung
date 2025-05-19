import React from "react";
import { Dialog, DialogContent, Typography } from "@mui/material";

const TrickResultDialog = ({ open, winner }) => {
  return (
    <Dialog open={open}>
      <DialogContent>
        <Typography variant="h6" align="center">
          Player {winner + 1} won the trick!
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default TrickResultDialog;
