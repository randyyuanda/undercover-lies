import { useState } from "react";
import { Button, Card, Typography } from "antd";
import type { Player } from "../model/Player";
import type { GameData } from "../model/GameData";

const { Title, Paragraph } = Typography;

type RoleRevealProps = {
  gameData: GameData;
  next: () => void;
};

const RoleReveal: React.FC<RoleRevealProps> = ({ gameData, next }) => {
  const [current, setCurrent] = useState(0);
  const [showRole, setShowRole] = useState(false);

  const { players, roles, words } = gameData;
  const currentPlayer = players[current];
  const playerRole = roles[currentPlayer.name];
  const word = playerRole === "civilian" ? words.civilian : words.undercover;

  const handleNext = () => {
    if (current + 1 < players.length) {
      setCurrent(current + 1);
      setShowRole(false);
    } else {
      next(); // move to next phase
    }
  };

  return (
    <Card>
      <Title level={4}>{currentPlayer.name}'s Turn</Title>

      {!showRole ? (
        <Button type="primary" onClick={() => setShowRole(true)}>
          Reveal Role
        </Button>
      ) : (
        <>
          {/* <Paragraph>
            <strong>Role:</strong> {playerRole}
          </Paragraph> */}
          <Paragraph>
            <strong>Your word:</strong> {word}
          </Paragraph>
          <Button type="primary" onClick={handleNext}>
            Next Player
          </Button>
        </>
      )}
    </Card>
  );
};

export default RoleReveal;
