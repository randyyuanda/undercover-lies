import { useEffect, useState } from "react";
import { Layout, Typography, message } from "antd";
import SetupGame from "../src/components/SetupGame";
import RoleReveal from "../src/components/RoleReveal";
import CluePhase from "../src/components/CluePhase";
import VotingPhase from "../src/components/VotingPhase";
import "antd/dist/reset.css"; // Ant Design styles
import type { GameData } from "./model/GameData";

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [step, setStep] = useState<
    "setup" | "reveal" | "clue" | "vote" | "result" | "end"
  >("setup");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [voteResults, setVoteResults] = useState<{ [player: string]: number }>(
    {}
  );
  const [eliminatedPlayer, setEliminatedPlayer] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    console.log(gameData);
  }, [gameData]);

  return (
    <Layout style={{ minHeight: "100vh", padding: "1rem" }}>
      <Header style={{ background: "#001529" }}>
        <Title style={{ color: "#fff", margin: 0 }} level={3}>
          Undercover Lies
        </Title>
      </Header>

      <Content style={{ marginTop: "2rem" }}>
        {step === "setup" && (
          <SetupGame
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
                setNotification("Eliminated: " + eliminatedName);

                let updatedPlayers = [...gameData.players];

                if (eliminatedName === undercoverName) {
                  // ✅ Civilians win: +1 point to each civilian
                  updatedPlayers = updatedPlayers.map((player) =>
                    gameData.roles[player.name] === "civilian"
                      ? { ...player, points: (player.points || 0) + 1 }
                      : player
                  );
                } else {
                  // ❌ Undercover not eliminated: Undercover gets +number of civilians
                  const numCivilians = updatedPlayers.filter(
                    (p) => gameData.roles[p.name] === "civilian"
                  ).length;

                  updatedPlayers = updatedPlayers.map((player) =>
                    player.name === undercoverName
                      ? {
                          ...player,
                          points: (player.points || 0) + numCivilians,
                        }
                      : player
                  );
                }

                // ✅ Go to next round if available
                if (gameData.round > 1) {
                  setTimeout(() => {
                    setGameData({
                      ...gameData,
                      players: updatedPlayers,
                      round: gameData.round - 1,
                      clues: {}, // reset for new round
                    });
                    setStep("reveal");
                  }, 2000);
                } else {
                  setGameData({ ...gameData, players: updatedPlayers });
                  setStep("end");
                }
              } else {
                setNotification("No majority. Undercover wins!");

                const numCivilians = gameData.players.filter(
                  (p) => gameData.roles[p.name] === "civilian"
                ).length;

                const updatedPlayers = gameData.players.map((player) =>
                  player.name === undercoverName
                    ? { ...player, points: (player.points || 0) + numCivilians }
                    : player
                );

                // Go to next round or end
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
        {notification && (
          <div
            style={{ margin: "1rem 0", color: "#faad14", fontWeight: "bold" }}
          >
            {notification}
          </div>
        )}
      </Content>
    </Layout>
  );
}

export default App;
