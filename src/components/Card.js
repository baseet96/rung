import { Paper } from "@mui/material";
import { motion } from "framer-motion";

const Card = ({ card }) => {
  const isRed = card.suit === "♥" || card.suit === "♦";

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Paper
        elevation={3}
        sx={{
          width: 40,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          m: 0.5,
          fontSize: 14,
          fontWeight: "bold",
          bgcolor: "#fffbe6",
          color: isRed ? "red" : "black",
        }}
      >
        {card.value}
        {card.suit}
      </Paper>
    </motion.div>
  );
};

export default Card;
