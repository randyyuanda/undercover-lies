import { useState } from "react";
import {
  Button,
  Card,
  Input,
  List,
  Modal,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import Lottie from "lottie-react";
import type { GameData } from "../model/GameData";
import { avatars } from "../data/avatar";

const { Title } = Typography;

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
  const [showWordModal, setShowWordModal] = useState(false);
  const [wordRevealed, setWordRevealed] = useState(false);

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
      onCluesSubmitted(updatedClues);
    }
  };

  const playerAvatar = avatars.find((a) => a.id === currentPlayer.avatar.id);

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {/* <Card style={{ width: "100%" }}> */}
      <Title className="text-header" level={4}>
        Clue Phase
      </Title>
      <Row justify="center" style={{ marginBottom: 16 }}>
        <Card
          hoverable
          onClick={() => setShowWordModal(true)}
          style={{ width: 150, textAlign: "center" }}
        >
          <Lottie
            animationData={playerAvatar?.animation}
            loop={true}
            style={{ height: 100 }}
          />
          <div style={{ marginTop: 8, fontSize: 24 }}>{currentPlayer.name}</div>
        </Card>
      </Row>

      <Input
        style={{ width: "70%" }}
        placeholder="Enter your clue"
        value={clue}
        onChange={(e) => setClue(e.target.value)}
      />
      <Button
        className="btn-start-game"
        type="primary"
        size="large"
        onClick={handleSubmitClue}
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
        <span style={{ textShadow: "1px 1px 2px #000" }}>Submit Clue</span>
      </Button>
      {/* <Button
        type="primary"
        onClick={handleSubmitClue}
        style={{ marginTop: 16 }}
      >
        Submit Clue
      </Button> */}

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

      <Modal
        title={`${currentPlayer.name}'s Word`}
        open={showWordModal}
        onOk={() => {
          setShowWordModal(false);
          setWordRevealed(false);
        }}
        onCancel={() => {
          setShowWordModal(false);
          setWordRevealed(false);
        }}
        okText="Close"
        centered
      >
        {wordRevealed ? (
          <p style={{ fontSize: 18, textAlign: "center" }}>
            <strong>Your word:</strong>{" "}
            <span
              onClick={() => setWordRevealed(false)}
              style={{
                cursor: "pointer",
              }}
            >
              {word}
            </span>
          </p>
        ) : (
          <p style={{ fontSize: 18, textAlign: "center" }}>
            <strong>
              Your word:{" "}
              <span
                onClick={() => setWordRevealed(true)}
                style={{
                  cursor: "pointer",
                }}
              >
                {"*".repeat(word.length)}
              </span>
            </strong>
          </p>
        )}
      </Modal>
    </Space>
  );
};

export default CluePhase;
