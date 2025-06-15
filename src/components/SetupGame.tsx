import { useState, useCallback } from "react";
import {
  Button,
  Input,
  InputNumber,
  message,
  Space,
  Row,
  Col,
  Card,
  Typography,
} from "antd";
import Lottie from "lottie-react";
import { avatars } from "../data/avatar";
import type { GameData } from "../model/GameData";
import type { Player } from "../model/Player";
import type { Avatar } from "../model/Avatar";
import detectiveData from "../assets/lotties/Detective.json"; // downloaded JSON
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const { Title } = Typography;

// const wordPairs = [
//   { civilian: "cat", undercover: "tiger" },
//   { civilian: "beach", undercover: "desert" },
//   { civilian: "tea", undercover: "coffee" },
//   { civilian: "sun", undercover: "lamp" },
//   { civilian: "book", undercover: "magazine" },
// ];

type SetupGameProps = {
  onStart: (data: GameData) => void;
  skipIntro?: boolean;
};

const SetupGame: React.FC<SetupGameProps> = ({ onStart, skipIntro }) => {
  const [step, setStep] = useState<"intro" | "count" | "player" | "review">(
    skipIntro ? "count" : "intro"
  );
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  // const [loading, setLoading] = useState(false);
  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);
  const handleNextPlayer = () => {
    if (!name.trim() || !selectedAvatar) {
      message.warning("Please enter a name and select an avatar.");
      return;
    }

    const alreadyUsedAvatar = players.some(
      (p) => p.avatar.id === selectedAvatar.id
    );
    if (alreadyUsedAvatar) {
      message.warning("Avatar already used. Choose a different one.");
      return;
    }

    const updated = [...players];
    updated[currentIndex] = {
      name: name.trim(),
      avatar: selectedAvatar,
      points: 0,
    };
    setPlayers(updated);

    if (currentIndex + 1 === playerCount) {
      setStep("review");
    } else {
      setCurrentIndex(currentIndex + 1);
      setName(updated[currentIndex + 1]?.name || "");
      setSelectedAvatar(updated[currentIndex + 1]?.avatar || null);
    }
  };

  const handleBack = () => {
    if (step === "player") {
      if (currentIndex === 0) {
        // Go back to count step
        setPlayers([]);
        setCurrentIndex(0);
        setName("");
        setSelectedAvatar(null);
        setStep("count");
      } else {
        // Go back to previous player
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        setName(players[prevIndex]?.name || "");
        setSelectedAvatar(players[prevIndex]?.avatar || null);
      }
    } else if (step === "review") {
      setStep("player");
      setCurrentIndex(playerCount - 1);
      setName(players[playerCount - 1]?.name || "");
      setSelectedAvatar(players[playerCount - 1]?.avatar || null);
    }
  };

  const handleStartGame = async () => {
    try {
      // setLoading(true);

      const language = "en";
      const filePath =
        language === "en" ? "/locales/english.json" : "/locales/indonesia.json";

      const res = await fetch(filePath);
      const data = await res.json();

      const wordPairs = data.wordPairs;
      const selectedPair =
        wordPairs[Math.floor(Math.random() * wordPairs.length)];

      const undercoverCount = playerCount >= 6 ? 2 : 1;
      const roles: { [name: string]: "civilian" | "undercover" } = {};

      const undercoverIndices: number[] = [];
      while (undercoverIndices.length < undercoverCount) {
        const idx = Math.floor(Math.random() * playerCount);
        if (!undercoverIndices.includes(idx)) undercoverIndices.push(idx);
      }

      players.forEach((player, index) => {
        roles[player.name] = undercoverIndices.includes(index)
          ? "undercover"
          : "civilian";
      });

      onStart({
        players,
        roles,
        words: selectedPair,
        clues: {},
        round: 3,
      });
    } catch (error) {
      console.error("Error loading word pairs:", error);
    } finally {
      // setLoading(false);
    }
  };

  if (step === "intro") {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* 🪄 Background particles */}

        <Particles
          id="tsparticles"
          init={particlesInit}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
          options={{
            fullScreen: false, // must be false if you wrap manually
            background: {
              color: "transparent",
            },
            particles: {
              number: { value: 60 },
              color: { value: "#FFD700" },
              shape: { type: "circle" },
              opacity: {
                value: 0.3,
                random: true,
              },
              size: {
                value: 3,
                random: { enable: true, minimumValue: 1 },
              },
              move: {
                direction: "none",
                enable: true,
                outMode: "bounce",
                speed: 0.3,
              },
            },

            // particles: {
            //   number: {
            //     value: 200,
            //   },
            //   color: {
            //     value: "#FFD700",
            //   },
            //   links: {
            //     enable: true,
            //     color: "#FFA500",
            //     distance: 150,
            //     opacity: 0.4,
            //     width: 1,
            //   },
            //   move: {
            //     enable: true,
            //     speed: 0.6,
            //   },
            //   size: {
            //     value: 2.5,
            //   },
            // },
          }}
        />

        {/* 🔮 Your intro content */}
        <Space
          direction="vertical"
          align="center"
          style={{
            zIndex: 1,
            position: "relative",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <Lottie
            animationData={detectiveData}
            loop
            autoPlay
            style={{ height: 120 }}
          />

          <Title className="text-header" level={2}>
            UNDERCOVER LIES
          </Title>
          <span
            className="text"
            style={{ color: "#ccc", fontStyle: "italic", marginBottom: "1rem" }}
          >
            "Guess the lie. Spot the spy."
          </span>
          <Button
            className="btn-start-game"
            type="primary"
            size="large"
            onClick={() => {
              setStep("count");
            }}
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
            <span style={{ textShadow: "1px 1px 2px #000" }}>
              🔍 Start Game
            </span>
          </Button>
        </Space>
      </div>
    );
  }

  // Render Steps
  if (step === "count") {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Title className="text-header" level={4}>
          Enter Number of Players
        </Title>
        <InputNumber
          size="large"
          min={3}
          max={6}
          defaultValue={3}
          onChange={(val) => {
            const count = val || 3;
            setPlayerCount(count);
            setPlayers(Array(count).fill(null));
          }}
        />
        <Button
          disabled={playerCount < 3}
          className="btn-start-game"
          type="primary"
          size="large"
          onClick={() => setStep("player")}
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
          <span style={{ textShadow: "1px 1px 2px #000" }}>Next</span>
        </Button>
      </Space>
    );
  }

  if (step === "player") {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Title className="text-header" level={4}>
          Player {currentIndex + 1}
        </Title>
        <Input
          size="large"
          placeholder="Enter player name"
          value={name}
          style={{ width: "50%" }}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="text-header">Select an Avatar:</p>
        <Row gutter={[12, 12]}>
          {avatars
            .filter(
              (avatar) =>
                !players.some(
                  (p, idx) =>
                    p?.avatar?.id === avatar.id && idx !== currentIndex
                )
            )
            .map((avatar: any) => (
              <Col key={avatar.id} span={6}>
                <Card
                  hoverable
                  onClick={() => setSelectedAvatar(avatar)}
                  style={{
                    border:
                      selectedAvatar?.id === avatar.id
                        ? "2px solid #1890ff"
                        : undefined,
                  }}
                >
                  <Lottie
                    animationData={avatar.animation}
                    loop
                    style={{ height: 80 }}
                  />
                </Card>
              </Col>
            ))}
        </Row>

        <Space>
          <Button size="large" onClick={handleBack}>
            Back
          </Button>
          <Button
            className="btn-start-game"
            type="primary"
            size="large"
            onClick={handleNextPlayer}
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
            <span style={{ textShadow: "1px 1px 2px #000" }}>
              {" "}
              {currentIndex + 1 === playerCount ? "Review" : "Next"}
            </span>
          </Button>
        </Space>
      </Space>
    );
  }

  if (step === "review") {
    return (
      <Space
        direction="vertical"
        style={{ width: "100%", height: "100%", justifyContent: "center" }}
      >
        <Title className="text-header" level={4}>
          Review Players
        </Title>
        <Row gutter={[12, 12]} justify={"center"} style={{ width: "100%" }}>
          {players.map((p, index) => (
            <Col key={index} xl={6} lg={6} md={6} xs={12}>
              <Card title={p.name} style={{ width: "100%" }}>
                <Lottie
                  animationData={p.avatar.animation}
                  loop
                  style={{ height: 80 }}
                />
              </Card>
            </Col>
          ))}
        </Row>
        <Space>
          <Button onClick={handleBack}>Back</Button>
          <Button
            className="btn-start-game"
            type="primary"
            size="large"
            onClick={handleStartGame}
            onMouseEnter={(e) => {
              // e.currentTarget.style.backgroundColor = "var(--color)";
              e.currentTarget.style.boxShadow =
                "0 0 16px #B80D57, 0 0 24px #A8026f";
            }}
            onMouseLeave={(e) => {
              // e.currentTarget.style.backgroundColor = "#A8026f";
              e.currentTarget.style.boxShadow =
                "0 0 10px #B80D57, 0 0 20px #A8026f";
            }}
          >
            <span style={{ textShadow: "1px 1px 2px #000" }}>Start Game</span>
          </Button>
          {/* <Button type="primary" onClick={handleStartGame} loading={loading}>
            Start Game
          </Button> */}
        </Space>
      </Space>
    );
  }

  return null;
};

export default SetupGame;
