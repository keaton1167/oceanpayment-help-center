export class AgentMockService {
  generateHandoffMessage() {
    return {
      mode: "mock",
      message: "本次帮助中心 build 包已生成。真实通知将在飞书集成完成后启用。"
    };
  }
}

