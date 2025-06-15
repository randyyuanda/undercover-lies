import { useEffect, useRef, useState } from "react";
import { Button, Layout, Row, Space, Typography } from "antd";
import SetupGame from "../src/components/SetupGame";
import RoleReveal from "../src/components/RoleReveal";
import CluePhase from "../src/components/CluePhase";
import VotingPhase from "../src/components/VotingPhase";
import "antd/dist/reset.css";
import type { GameData } from "./model/GameData";
import LeaderboardModal from "./components/LeaderboardModal";
import { TrophyOutlined } from "@ant-design/icons";

const { Content } = Layout;

function App() {
  const [step, setStep] = useState<
    "setup" | "reveal" | "clue" | "vote" | "result" | "end"
  >("setup");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);

  useEffect(() => {
    console.log(gameData);
  }, [gameData]);

  useEffect(() => {
    if (step === "end") {
      setShowLeaderboard(true);
    }
  }, [step]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  const playMusic = async () => {
    if (isPlayingRef.current) return;

    if (!audioRef.current) {
      audioRef.current = new Audio("/assets/music/bg-sound.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    }

    try {
      await audioRef.current.play();
      isPlayingRef.current = true;
      console.log("🎵 Music playing");
    } catch (err) {
      console.warn("❌ Failed to play sound:", err);
    }
  };
  useEffect(() => {
    const tryPlay = () => {
      playMusic();
      document.removeEventListener("click", tryPlay);
    };

    document.addEventListener("click", tryPlay);
    return () => document.removeEventListener("click", tryPlay);
  }, []);
  return (
    <Layout
      style={{
        padding: "1rem",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* <Header style={{ background: "#001529" }}>
        <Title style={{ color: "#fff", margin: 0 }} level={3}>
          Undercover Lies
        </Title>
      </Header> */}
      <Row justify="end" style={{ width: "100%", padding: "1rem" }}>
        <Space>
          {gameData && (
            <Button
              onClick={() => {
                setSkipIntro(true);
                setGameData(null);
                setStep("setup");
                setNotification(null);
              }}
              style={{
                backgroundColor: "#ffcc00",
                color: "#000",
                borderRadius: "20px",
                fontWeight: "bold",
                boxShadow: "0 0 10px rgba(255, 204, 0, 0.5)",
                padding: "6px 16px",
                border: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#ffdd33";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffcc00";
              }}
            >
              Start New Game
            </Button>
          )}

          <Button
            onClick={() => setShowLeaderboard(true)}
            icon={<TrophyOutlined />}
            style={{
              backgroundColor: "#1f1b2e",
              color: "#fff",
              border: "1px solid #fff",
              borderRadius: "20px",
              boxShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
              fontWeight: "bold",
              padding: "6px 16px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#3a325d";
              e.currentTarget.style.boxShadow = "0 0 12px #ffa500";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1f1b2e";
              e.currentTarget.style.boxShadow =
                "0 0 10px rgba(255, 255, 255, 0.3)";
            }}
          >
            Leaderboard
          </Button>
        </Space>
      </Row>

      <Content
        style={{
          justifyContent: "cetner",
          alignItems: "center",
          display: "flex",
          width: "100%",
        }}
      >
        {step === "setup" && (
          <SetupGame
            skipIntro={skipIntro}
            onStart={(data) => {
              setGameData(data);
              setStep("reveal");
            }}
          />
        )}
        {step === "reveal" && gameData && (
          <RoleReveal gameData={gameData} next={() => setStep("clue")} />
        )}
        {step === "clue" && gameData && (
          <CluePhase
            gameData={gameData}
            onCluesSubmitted={(cluesArray) => {
              const cluesObj: { [player: string]: string } = {};
              cluesArray.forEach(({ player, clue }) => {
                cluesObj[player] = clue;
              });

              setGameData({ ...gameData, clues: cluesObj });
              setStep("vote");
            }}
          />
        )}
        {step === "vote" && gameData && (
          <VotingPhase
            gameData={gameData}
            next={(voteResults) => {
              const voteEntries = Object.entries(voteResults);
              const maxVoteCount = Math.max(
                ...voteEntries.map(([, count]) => count)
              );
              const topVoted = voteEntries.filter(
                ([, count]) => count === maxVoteCount
              );
              const majorityThreshold = Math.ceil(gameData.players.length / 2);
              const undercoverName =
                Object.entries(gameData.roles).find(
                  ([, role]) => role === "undercover"
                )?.[0] || "";

              if (topVoted.length === 1 && maxVoteCount >= majorityThreshold) {
                const eliminatedName = topVoted[0][0];
                if (eliminatedName === undercoverName) {
                  setNotification("Civilians win!");
                } else {
                  setNotification("Undercover wins!");
                }

                // setNotification("Eliminated: " + eliminatedName);

                let updatedPlayers = [...gameData.players];

                if (eliminatedName === undercoverName) {
                  updatedPlayers = updatedPlayers.map((player) =>
                    gameData.roles[player.name] === "civilian"
                      ? { ...player, points: (player.points || 0) + 2 }
                      : player
                  );
                } else {
                  const numCivilians = updatedPlayers.filter(
                    (p) => gameData.roles[p.name] === "civilian"
                  ).length;

                  updatedPlayers = updatedPlayers.map((player) =>
                    player.name === undercoverName
                      ? {
                          ...player,
                          points: (player.points || 0) + numCivilians * 5,
                        }
                      : player
                  );
                }

                if (gameData.round > 1) {
                  setTimeout(() => {
                    setGameData({
                      ...gameData,
                      players: updatedPlayers,
                      round: gameData.round - 1,
                      clues: {},
                    });
                    setStep("reveal");
                    setNotification(null);
                  }, 2000);
                } else {
                  setGameData({ ...gameData, players: updatedPlayers });
                  setStep("end");
                }
              } else {
                setNotification("Undercover wins!");

                const numCivilians = gameData.players.filter(
                  (p) => gameData.roles[p.name] === "civilian"
                ).length;

                const updatedPlayers = gameData.players.map((player) =>
                  player.name === undercoverName
                    ? { ...player, points: (player.points || 0) + numCivilians }
                    : player
                );

                if (gameData.round > 1) {
                  setTimeout(() => {
                    setGameData({
                      ...gameData,
                      players: updatedPlayers,
                      round: gameData.round - 1,
                      clues: {},
                    });
                    setStep("reveal");
                    setNotification(null);
                  }, 2000);
                } else {
                  setGameData({ ...gameData, players: updatedPlayers });
                  setStep("end");
                }
              }
            }}
          />
        )}
        {/* {notification && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row>{notification}</Row>
          </Space>
        )} */}
        <br />

        <LeaderboardModal
          visible={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          players={gameData?.players || []}
        />
      </Content>
      {notification && (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Row>
            <span className="text-header">{notification}</span>
          </Row>
        </Space>
      )}
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, color: "var(--color-text)" }}
      >
        © 2025 Randy Yuanda • Undercover Lies
      </Typography.Text>
    </Layout>
  );
}

export default App;
