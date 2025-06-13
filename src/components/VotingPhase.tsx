import { useState } from "react";
import { Button, Card, Select, Typography, List } from "antd";
import type { GameData } from "../model/GameData";

const { Title } = Typography;
const { Option } = Select;

type VotingPhaseProps = {
  gameData: GameData;
  next: (voteResults: { [player: string]: number }) => void;
};

const VotingPhase: React.FC<VotingPhaseProps> = ({ gameData, next }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<{ [player: string]: number }>({});
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  const players = gameData.players;
  const currentPlayer = players[currentIndex];

  const handleVote = () => {
    if (!selectedVote) return;

    const updatedVotes = {
      ...votes,
      [selectedVote]: (votes[selectedVote] || 0) + 1,
    };

    if (currentIndex + 1 < players.length) {
      setVotes(updatedVotes);
      setCurrentIndex(currentIndex + 1);
      setSelectedVote(null);
    } else {
      next(updatedVotes);
    }
  };

  return (
    <Card>
      <Title level={4}>Voting Phase</Title>
      <p>
        <strong>{currentPlayer.name}</strong>, choose someone to vote (or skip):
      </p>

      <Select
        placeholder="Vote a player or choose no vote"
        style={{ width: "100%", marginBottom: "1rem" }}
        value={selectedVote || undefined}
        onChange={(value) => setSelectedVote(value)}
      >
        {players
          .filter((p) => p.name !== currentPlayer.name)
          .map((player) => (
            <Option key={player.name} value={player.name}>
              {player.name}
            </Option>
          ))}
        <Option value="no_vote">No Vote</Option>
      </Select>

      <Button
        type="primary"
        onClick={handleVote}
        disabled={selectedVote === null}
      >
        Submit Vote
      </Button>

      <List
        header={<strong>Votes So Far:</strong>}
        dataSource={Object.entries(votes).map(([player, count]) => {
          const name = player === "no_vote" ? "No Vote" : player;
          return `${name}: ${count} vote${count > 1 ? "s" : ""}`;
        })}
        renderItem={(item) => <List.Item>{item}</List.Item>}
        style={{ marginTop: "2rem" }}
      />
    </Card>
  );
};

export default VotingPhase;
