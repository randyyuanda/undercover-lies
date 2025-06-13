import { useEffect, useState } from "react";
import { Button, Card, Input, List, Typography, message } from "antd";
import type { GameData } from "../model/GameData";
import type { Player } from "../model/Player";

const { Title, Paragraph } = Typography;

type CluePhaseProps = {
  gameData: GameData;
  onCluesSubmitted: (clues: { player: string; clue: string }[]) => void;
};

const CluePhase: React.FC<CluePhaseProps> = ({
  gameData,
  onCluesSubmitted,
}) => {
  const { players, roles, words } = gameData;

  const [current, setCurrent] = useState(0);
  const [clue, setClue] = useState("");
  const [clues, setClues] = useState<{ player: string; clue: string }[]>([]);

  const currentPlayer = players[current];
  const playerRole = roles[currentPlayer.name];
  const word = playerRole === "civilian" ? words.civilian : words.undercover;

  const handleSubmitClue = () => {
    if (!clue.trim()) {
      message.warning("Clue cannot be empty.");
      return;
    }

    const updatedClues = [...clues, { player: currentPlayer.name, clue }];
    setClues(updatedClues);
    setClue("");

    if (current + 1 < players.length) {
      setCurrent(current + 1);
    } else {
      onCluesSubmitted(updatedClues); // move to next phase
    }
  };

  useEffect(() => {
    console.log(clues);
  }, [clues]);
  return (
    <Card>
      <Title level={4}>{currentPlayer.name}'s Turn</Title>
      <Paragraph>
        <strong>Your word:</strong> {word}
      </Paragraph>
      <Input
        placeholder="Enter your clue"
        value={clue}
        onChange={(e) => setClue(e.target.value)}
      />
      <Button
        type="primary"
        onClick={handleSubmitClue}
        style={{ marginTop: 16 }}
      >
        Submit Clue
      </Button>
      <List
        header={<strong>Clues Given:</strong>}
        dataSource={clues}
        renderItem={(item) => (
          <List.Item>
            {item.player}: {item.clue}
          </List.Item>
        )}
        style={{ marginTop: "2rem" }}
      />
    </Card>
  );
};

export default CluePhase;
