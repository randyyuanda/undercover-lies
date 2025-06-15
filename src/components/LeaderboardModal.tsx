import { Modal, List, Avatar as AntdAvatar, Typography, Space } from "antd";
import { CrownFilled, TrophyFilled, StarFilled } from "@ant-design/icons";
import Lottie from "lottie-react";
import type { Player } from "../model/Player";

const { Title, Text } = Typography;

type LeaderboardModalProps = {
  visible: boolean;
  onClose: () => void;
  players: Player[];
};

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

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  visible,
  onClose,
  players,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      title={
        <Title
          className="text-header"
          level={3}
          style={{ margin: 0, textAlign: "center" }}
        >
          🏆 Leaderboard
        </Title>
      }
    >
      <List
        itemLayout="horizontal"
        dataSource={sortedPlayers}
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
    </Modal>
  );
};

export default LeaderboardModal;
