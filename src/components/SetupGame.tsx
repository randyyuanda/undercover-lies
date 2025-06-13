import { useState } from "react";
import { Button, Form, InputNumber, message } from "antd";
import type { FormInstance } from "antd/es/form";
import type { GameData } from "../model/GameData";
import type { Player } from "../model/Player";

type SetupGameProps = {
  onStart: (data: GameData) => void;
};

const wordPairs = [
  { civilian: "cat", undercover: "tiger" },
  { civilian: "beach", undercover: "desert" },
  { civilian: "tea", undercover: "coffee" },
  { civilian: "sun", undercover: "lamp" },
  { civilian: "book", undercover: "magazine" },
];

const SetupGame: React.FC<SetupGameProps> = ({ onStart }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleStart = (values: { playerCount: number }) => {
    if (values.playerCount < 3) {
      alert("Minimum 3");
      message.warning("Minimum 3 players required");
      return;
    }

    setLoading(true);

    // Random word pair
    const selectedPair =
      wordPairs[Math.floor(Math.random() * wordPairs.length)];

    // Assign 1-2 undercover roles
    const playerCount = values.playerCount;
    const undercoverCount = playerCount >= 6 ? 2 : 1;

    // const roles = Array(playerCount).fill("civilian");
    // for (let i = 0; i < undercoverCount; i++) {
    //   let index: number;
    //   do {
    //     index = Math.floor(Math.random() * playerCount);
    //   } while (roles[index] === "undercover");
    //   roles[index] = "undercover";
    // }

    const roles: { [name: string]: "civilian" | "undercover" } = {};

    const playerNames = Array.from(
      { length: playerCount },
      (_, i) => `Player ${i + 1}`
    );

    // Randomize undercover roles
    const undercoverIndices: number[] = [];
    while (undercoverIndices.length < undercoverCount) {
      const randomIndex = Math.floor(Math.random() * playerCount);
      if (!undercoverIndices.includes(randomIndex)) {
        undercoverIndices.push(randomIndex);
      }
    }
    const players: Player[] = playerNames.map((name, index) => {
      const role = undercoverIndices.includes(index)
        ? "undercover"
        : "civilian";
      roles[name] = role;
      return { name, points: 0 };
    });
    onStart({
      players,
      roles,
      words: selectedPair,
      clues: {},
      round: 3,
    });

    setLoading(false);
  };

  return (
    <Form form={form} onFinish={handleStart} layout="vertical">
      <Form.Item
        label="Number of Players"
        name="playerCount"
        rules={[
          { required: true, message: "Please input number of players!" },
          {
            validator: (_, value) =>
              value >= 3
                ? Promise.resolve()
                : Promise.reject(new Error("At least 3 players are required")),
          },
        ]}
      >
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Start Game
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SetupGame;
