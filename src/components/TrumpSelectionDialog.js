import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
} from "@mui/material";
import Card from "./Card";
import { suits } from "../helpers/cardUtils";

const TrumpSelectionDialog = ({ open, cards, onSelectTrump }) => (
  <Dialog open={open}>
    <DialogTitle>Player 1: Choose Trump Suit</DialogTitle>
    <DialogContent>
      <Box mb={2}>
        <Typography variant="h6">Your Cards (Player 1):</Typography>
        <Box display="flex" gap={1}>
          {cards.map((card, index) => (
            <Card key={index} card={card} />
          ))}
        </Box>
      </Box>
      <Typography variant="h6">Choose Trump Suit:</Typography>
      <Box display="flex" gap={2} p={1}>
        {suits.map((suit) => (
          <Button
            key={suit}
            variant="contained"
            color="success"
            onClick={() => onSelectTrump(suit)}
          >
            {suit}
          </Button>
        ))}
      </Box>
    </DialogContent>
  </Dialog>
);

export default TrumpSelectionDialog;
