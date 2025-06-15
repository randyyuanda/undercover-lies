import { useEffect, useRef, useState } from "react";
import { Button, Layout, List, Row, Space, Typography } from "antd";
import SetupGame from "../src/components/SetupGame";
import RoleReveal from "../src/components/RoleReveal";
import CluePhase from "../src/components/CluePhase";
import VotingPhase from "../src/components/VotingPhase";
import "antd/dist/reset.css";
import type { GameData } from "./model/GameData";
import LeaderboardModal from "./components/LeaderboardModal";
import {
  CrownFilled,
  StarFilled,
  TrophyFilled,
  TrophyOutlined,
} from "@ant-design/icons";
import Lottie from "lottie-react";
import Title from "antd/es/typography/Title";
const { Text } = Typography;

const { Content } = Layout;
type WordPair = { civilian: string; undercover: string };

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

  // useEffect(() => {
  //   if (step === "end") {
  //     setShowLeaderboard(true);
  //   }
  // }, [step]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const getMedal = (index: number) => {
    switch (index) {
      case 0:
        return <CrownFilled style={{ color: "#fadb14", fontSize: 20 }} />;
      case 1:
        return <TrophyFilled style={{ color: "#bfbfbf", fontSize: 18 }} />;
      case 2:
        return <StarFilled style={{ color: "#cd7f32", fontSize: 18 }} />;
      default:
        return <span style={{ width: 20 }} />;
    }
  };
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
      {step !== "end" && (
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
                style={{ boxShadow: "none" }}
                className="btn-start-game"
                // onMouseEnter={(e) => {
                //   e.currentTarget.style.backgroundColor = "#ffdd33";
                // }}
                // onMouseLeave={(e) => {
                //   e.currentTarget.style.backgroundColor = "#ffcc00";
                // }}
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
      )}

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
              const eliminatedName = topVoted[0][0];

              if (
                topVoted.length === 1 &&
                maxVoteCount >= majorityThreshold &&
                eliminatedName != "no_vote"
              ) {
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
                const getNewWordPair = (
                  allPairs: WordPair[],
                  used: string[]
                ): WordPair => {
                  const filtered = allPairs.filter(
                    ({ civilian, undercover }) =>
                      !used.includes(`${civilian}|${undercover}`) &&
                      !used.includes(`${undercover}|${civilian}`)
                  );

                  const chosen =
                    filtered[Math.floor(Math.random() * filtered.length)];

                  // Add used pair to history (for both directions)
                  used.push(`${chosen.civilian}|${chosen.undercover}`);

                  return chosen;
                };
                if (gameData.round > 1) {
                  setTimeout(async () => {
                    const res = await fetch("/locales/english.json"); // or switch by language
                    const data = await res.json();
                    const allPairs: WordPair[] = data.wordPairs;

                    const newWords = getNewWordPair(
                      allPairs,
                      gameData.usedWordPairs
                    );

                    // reassign new roles randomly
                    const undercoverCount =
                      gameData.players.length >= 6 ? 2 : 1;
                    const roles: { [name: string]: "civilian" | "undercover" } =
                      {};
                    const undercoverIndices: number[] = [];

                    while (undercoverIndices.length < undercoverCount) {
                      const idx = Math.floor(
                        Math.random() * gameData.players.length
                      );
                      if (!undercoverIndices.includes(idx))
                        undercoverIndices.push(idx);
                    }

                    gameData.players.forEach((player, index) => {
                      roles[player.name] = undercoverIndices.includes(index)
                        ? "undercover"
                        : "civilian";
                    });

                    setGameData({
                      ...gameData,
                      players: updatedPlayers,
                      round: gameData.round - 1,
                      roles,
                      words: {
                        civilian: newWords.civilian,
                        undercover: newWords.undercover,
                      },
                      clues: {},
                      usedWordPairs: [...gameData.usedWordPairs],
                    });

                    setStep("reveal");
                    setNotification(null);
                  }, 2000);
                } else {
                  setGameData({ ...gameData, players: updatedPlayers });
                  setStep("end");
                }
              } else {
                setNotification("No majority. Repeat clue and vote.");

                // Delay a bit before looping
                setTimeout(() => {
                  setGameData({
                    ...gameData,
                    clues: {},
                  });
                  setStep("clue");
                  setNotification(null);
                }, 2000);
              }
            }}
          />
        )}
        {step === "end" && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Title
              className="text-header"
              level={3}
              style={{ margin: 0, textAlign: "center" }}
            >
              🏆 Leaderboard
            </Title>
            <List
              style={{ width: "100%" }}
              itemLayout="horizontal"
              dataSource={gameData?.players.sort((a, b) => b.points - a.points)}
              renderItem={(player, index) => (
                <List.Item
                  style={{
                    backgroundColor: index === 0 ? "#fffbe6" : "#f0f2f5",
                    borderRadius: 12,
                    marginBottom: 12,
                    padding: 16,
                  }}
                >
                  <List.Item.Meta
                    className="list-item-avatar"
                    avatar={
                      <Lottie
                        animationData={player.avatar.animation}
                        style={{ height: 50 }}
                      />
                    }
                    title={
                      <Space align="center">
                        {getMedal(index)}
                        <Text strong style={{ width: "max-content" }}>
                          {player.name}
                        </Text>
                      </Space>
                    }
                    description={
                      <Text type="secondary">Points: {player.points}</Text>
                    }
                  />
                </List.Item>
              )}
            />
            <Button
              onClick={() => {
                setSkipIntro(true);
                setGameData(null);
                setStep("setup");
                setNotification(null);
              }}
              style={{ boxShadow: "none" }}
              className="btn-start-game"
              // onMouseEnter={(e) => {
              //   e.currentTarget.style.backgroundColor = "#ffdd33";
              // }}
              // onMouseLeave={(e) => {
              //   e.currentTarget.style.backgroundColor = "#ffcc00";
              // }}
            >
              🔍 Start New Game
            </Button>
          </Space>
        )}
        {/* {notification && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row>{notification}</Row>
          </Space>
        )} */}

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
