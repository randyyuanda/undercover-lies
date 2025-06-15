import { useState } from "react";
import { Button, Select, Typography, List, Space } from "antd";
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
    <Space direction="vertical" style={{ width: "100%" }}>
      <Title className="text-header" level={4}>
        Voting Phase
      </Title>
      <p>
        <strong>{currentPlayer.name}</strong>, choose someone to vote (or skip):
      </p>

      <Select
        placeholder="Vote a player or choose no vote"
        style={{ width: "70%", marginBottom: "1rem" }}
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
        className="btn-start-game"
        type="primary"
        size="large"
        onClick={handleVote}
        disabled={selectedVote === null}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#FFA500";
          e.currentTarget.style.boxShadow =
            "0 0 16px #FFD700, 0 0 24px #FF8C00";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#FF8C00";
          e.currentTarget.style.boxShadow =
            "0 0 10px #FFD700, 0 0 20px #FF8C00";
        }}
      >
        <span style={{ textShadow: "1px 1px 2px #000" }}>Submit Vote</span>
      </Button>
      {/* <Button
        type="primary"
        onClick={handleVote}
        disabled={selectedVote === null}
      >
        Submit Vote
      </Button> */}

      <List
        header={<strong>Votes So Far:</strong>}
        dataSource={Object.entries(votes).map(([player, count]) => {
          const name = player === "no_vote" ? "No Vote" : player;
          return `${name}: ${count} vote${count > 1 ? "s" : ""}`;
        })}
        renderItem={(item) => <List.Item>{item}</List.Item>}
        style={{ marginTop: "2rem" }}
      />
    </Space>
  );
};

export default VotingPhase;
