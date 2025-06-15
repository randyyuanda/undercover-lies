import { useState, useEffect } from "react";
import { Typography, Modal, Row, Col, Tooltip, Space } from "antd";
import type { GameData } from "../model/GameData";
import Lottie from "lottie-react";
import { avatars } from "../data/avatar";

const { Title } = Typography;

type RoleRevealProps = {
  gameData: GameData;
  next: () => void;
};

const RoleReveal: React.FC<RoleRevealProps> = ({ gameData, next }) => {
  const { players, roles, words } = gameData;

  const [revealOrder, setRevealOrder] = useState<string[]>([]);
  const [revealedPlayers, setRevealedPlayers] = useState<Set<string>>(
    new Set()
  );
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [wordRevealed, setWordRevealed] = useState(false);

  useEffect(() => {
    const shuffled = [...players.map((p) => p.name)].sort(
      () => Math.random() - 0.5
    );
    setRevealOrder(shuffled);
  }, [players]);

  const handleReveal = (playerName: string) => {
    if (!revealedPlayers.has(playerName)) {
      setSelectedPlayer(playerName);
    }
  };

  const handleDone = () => {
    setWordRevealed(false);
    if (selectedPlayer) {
      setRevealedPlayers((prev) => new Set(prev).add(selectedPlayer));
      setSelectedPlayer(null);
    }

    if (revealedPlayers.size + 1 === players.length) {
      next();
    }
  };

  const getWordForPlayer = (name: string) =>
    roles[name] === "civilian" ? words.civilian : words.undercover;

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Row>
        <Title level={3} style={{ textAlign: "center", marginBottom: 32 }}>
          <span className="text-header-font">🔍</span>{" "}
          <span className="text-header"> Role Reveal</span>
        </Title>
      </Row>

      <Row gutter={[16, 24]} justify="center">
        {revealOrder.map((name) => {
          const player = players.find((p) => p.name === name);
          if (!player) return null;

          const playerAvatar = avatars.find((a) => a.id === player.avatar.id);
          if (!playerAvatar) return null;

          return (
            <Col
              key={name}
              xs={12}
              sm={8}
              md={6}
              style={{ textAlign: "center" }}
            >
              <Tooltip
                title={
                  revealedPlayers.has(name)
                    ? "Already revealed"
                    : "Click to reveal"
                }
              >
                <div
                  onClick={() => handleReveal(name)}
                  style={{
                    cursor: revealedPlayers.has(name)
                      ? "not-allowed"
                      : "pointer",
                    opacity: revealedPlayers.has(name) ? 0.4 : 1,
                    transition: "opacity 0.3s",
                  }}
                >
                  <div
                    style={{
                      border: "2px solid #f0f0f0",
                      borderRadius: 12,
                      padding: 10,
                      backgroundColor: "#fafafa",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Lottie
                      animationData={playerAvatar.animation}
                      loop
                      style={{ height: 120 }}
                    />
                    <div style={{ marginTop: 8, fontWeight: 500 }}>{name}</div>
                  </div>
                </div>
              </Tooltip>
            </Col>
          );
        })}
      </Row>

      <Modal
        title={`${selectedPlayer}'s Role`}
        open={!!selectedPlayer}
        onOk={handleDone}
        onCancel={() => setSelectedPlayer(null)}
        okText="Done"
        cancelText="Cancel"
        cancelButtonProps={{ style: { display: "none" } }}
        centered
      >
        <p style={{ fontSize: "1.1rem" }}>
          <strong>Your word:</strong>{" "}
          {wordRevealed ? (
            <span
              onClick={() => setWordRevealed(false)}
              style={{
                cursor: "pointer",
              }}
            >
              {selectedPlayer ? getWordForPlayer(selectedPlayer) : ""}
            </span>
          ) : (
            <strong>
              <span
                onClick={() => setWordRevealed(true)}
                style={{
                  cursor: "pointer",
                }}
              >
                {selectedPlayer
                  ? "*".repeat(getWordForPlayer(selectedPlayer).length)
                  : ""}
              </span>
            </strong>
          )}
        </p>
      </Modal>
    </Space>
  );
};

export default RoleReveal;
