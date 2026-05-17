/**
 * Mock data factory for demo/development mode.
 * Extracted from server.ts (A3) to keep the composition root lean.
 */
import {
  Workspace,
  WorkspaceProps,
  EpistemicNode,
  EpistemicNodeProps,
  EpistemicEdge,
  WorkspaceStatus,
  WorkspaceMode,
  WorkspaceSensitivity,
  NodeType,
  NodeStrength,
  EpistemicEdgeType,
  Source,
} from "@epios/domain";

export interface MockData {
  workspaces: Workspace[];
  nodes: EpistemicNode[];
  edges: EpistemicEdge[];
  sources: Source[];
}

function createWorkspaceEData(): {
  nodes: EpistemicNode[];
  edges: EpistemicEdge[];
} {
  const workspaceEId = "m5";
  const nodes: EpistemicNodeProps[] = Array.from({ length: 50 }, (_, i) => ({
    id: `ne${i + 1}`,
    workspaceId: workspaceEId,
    missionId: "mission-e",
    type: (i % 3 === 0
      ? "hypothesis"
      : i % 2 === 0
        ? "observation"
        : "claim") as NodeType,
    content: [
      "Recursive depth instability detected in layer " + (i + 1),
      "Gradient vanishing in cross-attention sub-block " + (i + 1),
      "Entropy collapse observed at temperature T=" + (0.1 + i / 50).toFixed(2),
      "Latent space fragmentation hypothesis #" + (i + 1),
      "Empirical trace of neuron group " + (i + 1) + " firing rate saturation",
      "Ablation study of attention head #" +
        (i + 1) +
        " reveals critical vulnerability",
    ][i % 6],
    strength: "moderate" as NodeStrength,
    metadata: {},
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const edges: EpistemicEdge[] = [];
  for (let i = 0; i < 50; i++) {
    const targets = [(i + 1) % 50, (i * 7 + 3) % 50, Math.floor(i / 5) * 5];

    targets.forEach((targetIdx, j) => {
      if (targetIdx !== i) {
        edges.push({
          id: `ee${i}-${j}`,
          workspaceId: workspaceEId,
          sourceNodeId: nodes[i].id,
          targetNodeId: nodes[targetIdx].id,
          type: ["supports", "contradicts", "refines", "addresses"][
            (i + j) % 4
          ] as EpistemicEdgeType,
          metadata: {},
          createdAt: new Date(),
        });
      }
    });
  }

  return {
    nodes: nodes.map((n) => new EpistemicNode(n as EpistemicNodeProps)),
    edges,
  };
}

function createRussianDemoData(): {
  nodes: EpistemicNode[];
  edges: EpistemicEdge[];
} {
  const nodes: EpistemicNodeProps[] = [
    // m7: 10 nodes
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `ws7-n${i}`,
      workspaceId: "m7",
      missionId: "mission-7",
      type: (i % 3 === 0
        ? "hypothesis"
        : i % 2 === 0
          ? "observation"
          : "claim") as NodeType,
      content: [
        "Микросервисы повышают масштабируемость системы",
        "Сложность отладки в распределенных системах увеличивается",
        "Необходимость внедрения распределенной трассировки (Jaeger/Zipkin)",
        "Выбор протокола: gRPC обеспечивает лучшую производительность чем REST",
        "Использование Kafka для асинхронного взаимодействия сервисов",
        "Риск рассогласованности данных (Eventual Consistency)",
        "Паттерн Saga для управления распределенными транзакциями",
        "Централизованное логирование (ELK Stack) критично для эксплуатации",
        "Kubernetes как стандарт оркестрации контейнеров",
        "Мониторинг через Prometheus и Grafana для контроля SLA",
      ][i],
      strength: "moderate" as NodeStrength,
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    // m8: 20 nodes
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `ws8-n${i}`,
      workspaceId: "m8",
      missionId: "mission-8",
      type: (i % 3 === 0
        ? "hypothesis"
        : i % 2 === 0
          ? "observation"
          : "claim") as NodeType,
      content:
        [
          "Облачные провайдеры снижают капитальные затраты (CAPEX)",
          "Безопасность данных в публичном облаке вызывает опасения",
          "Гибридное облако — оптимальный баланс для энтерпрайза",
          "Задержка сети (Latency) между on-prem и облаком",
          "Автоматическое масштабирование (Auto-scaling) экономит ресурсы",
          "Vendor lock-in: сложность миграции между провайдерами",
          "Terraform для управления инфраструктурой как кодом (IaC)",
          "Облачные базы данных (Managed SQL) упрощают администрирование",
          "Стоимость исходящего трафика (Egress) может быть высокой",
          "Serverless (Lambda/Cloud Functions) для событийных задач",
        ][i % 10] + ` (Аргумент #${i + 1})`,
      strength: "moderate" as NodeStrength,
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    // m9: 50 nodes
    ...Array.from({ length: 50 }, (_, i) => ({
      id: `ws9-n${i}`,
      workspaceId: "m9",
      missionId: "mission-9",
      type: (i % 3 === 0
        ? "hypothesis"
        : i % 2 === 0
          ? "observation"
          : "claim") as NodeType,
      content:
        [
          "Бонусные баллы должны сгорать через 12 месяцев",
          "Интеграция with кассовым ПО (POS) — критическая точка отказа",
          "Мобильное приложение как основной канал взаимодействия",
          "Персонализация предложений на основе ML-моделей",
          "Риск фрода (мошенничества) with начислением баллов",
          "Высокая нагрузка в периоды распродаж (Черная пятница)",
          "Соответствие ФЗ-152 о персональных данных",
          "Омниканальность: единый баланс в онлайне и офлайне",
          "A/B тесты механик лояльности для повышения конверсии",
          "Партнерская сеть: возможность тратить баллы у партнеров",
        ][i % 10] + ` (Деталь #${i + 1})`,
      strength: "strong" as NodeStrength,
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  ];

  const edges: EpistemicEdge[] = [
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `ws7-e${i}`,
      workspaceId: "m7",
      sourceNodeId: `ws7-n${i}`,
      targetNodeId: `ws7-n${i + 1}`,
      type: (i % 3 === 0 ? "contradicts" : "supports") as EpistemicEdgeType,
      metadata: {},
      createdAt: new Date(),
    })),
    ...Array.from({ length: 19 }, (_, i) => ({
      id: `ws8-e${i}`,
      workspaceId: "m8",
      sourceNodeId: `ws8-n${i + 1}`,
      targetNodeId: `ws8-n0`,
      type: (i % 2 === 0 ? "supports" : "contradicts") as EpistemicEdgeType,
      metadata: {},
      createdAt: new Date(),
    })),
    ...Array.from({ length: 50 }, (_, i) => ({
      id: `ws9-e${i}`,
      workspaceId: "m9",
      sourceNodeId: `ws9-n${i}`,
      targetNodeId: `ws9-n${(i + 5) % 50}`,
      type: (i % 3 === 0 ? "contradicts" : "supports") as EpistemicEdgeType,
      metadata: {},
      createdAt: new Date(),
    })),
  ];

  return {
    nodes: nodes.map((n) => new EpistemicNode(n as EpistemicNodeProps)),
    edges,
  };
}

export function createMockData(): MockData {
  const workspaceE = createWorkspaceEData();
  const russianDemo = createRussianDemoData();

  const workspaces: Workspace[] = [
    {
      id: "m1",
      title: "Scenario A: Climate Research",
      status: "running" as WorkspaceStatus,
      mode: "assisted" as WorkspaceMode,
      sensitivity: "internal" as WorkspaceSensitivity,
      version: 1,
      brief: {
        goal: "Synthesize Arctic melt impact",
        successCriteria: [],
        constraints: [],
        unknowns: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: { type: "user", id: "researcher-1" },
    },
    {
      id: "m2",
      title: "Scenario B: Crisis Response",
      status: "running" as WorkspaceStatus,
      mode: "assisted" as WorkspaceMode,
      sensitivity: "internal" as WorkspaceSensitivity,
      version: 1,
      brief: {
        goal: "Suez Canal blockage mitigation",
        successCriteria: [],
        constraints: [],
        unknowns: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: { type: "user", id: "logistics-ai" },
    },
    {
      id: "m3",
      title: "Scenario C: AI Governance",
      status: "running" as WorkspaceStatus,
      mode: "assisted" as WorkspaceMode,
      sensitivity: "internal" as WorkspaceSensitivity,
      version: 1,
      brief: {
        goal: "Finalize Human-in-the-loop policy",
        successCriteria: [],
        constraints: [],
        unknowns: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: { type: "user", id: "ethics-board" },
    },
    {
      id: "m4",
      title: "Scenario D: Knowledge Synthesis",
      status: "running" as WorkspaceStatus,
      mode: "assisted" as WorkspaceMode,
      sensitivity: "internal" as WorkspaceSensitivity,
      version: 1,
      brief: {
        goal: "Neural Architecture Search summary",
        successCriteria: [],
        constraints: [],
        unknowns: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: { type: "user", id: "dev-team" },
    },
    {
      id: "m5",
      title: "Scenario E: Neural Network Collapse",
      status: "running" as WorkspaceStatus,
      mode: "assisted" as WorkspaceMode,
      sensitivity: "internal" as WorkspaceSensitivity,
      version: 1,
      brief: {
        goal: "Stress-test large-scale transformer stability",
        successCriteria: ["Map 50 critical points"],
        constraints: [],
        unknowns: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: { type: "user", id: "safety-agent" },
    },
    {
      id: "m6",
      title: "Scenario F: ADR Review - Event Sourcing",
      status: "running" as WorkspaceStatus,
      mode: "assisted" as WorkspaceMode,
      sensitivity: "internal" as WorkspaceSensitivity,
      version: 1,
      brief: {
        goal: "Review and finalize ADR for event-driven architecture",
        successCriteria: ["Map critical points", "Narrow decision scope"],
        constraints: [],
        unknowns: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: { type: "user", id: "architect-1" },
    },
    {
      id: "m7",
      title: "Демо: Микросервисы (10 нод)",
      status: "running" as WorkspaceStatus,
      mode: "assisted" as WorkspaceMode,
      sensitivity: "internal" as WorkspaceSensitivity,
      version: 1,
      brief: {
        goal: "Оценка архитектурных рисков при переходе на микросервисы",
        successCriteria: ["Выявить 5 рисков"],
        constraints: [],
        unknowns: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: { type: "user", id: "architect-1" },
    },
    {
      id: "m8",
      title: "Демо: Облачная миграция (20 нод)",
      status: "running" as WorkspaceStatus,
      mode: "assisted" as WorkspaceMode,
      sensitivity: "internal" as WorkspaceSensitivity,
      version: 1,
      brief: {
        goal: "Синтез стратегии переноса legacy-систем в облако",
        successCriteria: ["Сформировать 3 стратегии"],
        constraints: [],
        unknowns: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: { type: "user", id: "cloud-architect" },
    },
    {
      id: "m9",
      title: "Демо: Система лояльности (50 нод)",
      status: "running" as WorkspaceStatus,
      mode: "assisted" as WorkspaceMode,
      sensitivity: "internal" as WorkspaceSensitivity,
      version: 1,
      brief: {
        goal: "Глубокий анализ требований и противоречий новой системы",
        successCriteria: ["Покрыть 50 аспектов системы"],
        constraints: [],
        unknowns: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: { type: "user", id: "business-analyst" },
    },
  ].map((p) => new Workspace(p as WorkspaceProps));

  const baseNodes: EpistemicNodeProps[] = [
    // Scenario A
    {
      id: "n1",
      workspaceId: "m1",
      missionId: "mission-1",
      type: "hypothesis",
      content:
        "Arctic ice melt accelerates global sea level rise by 20% by 2050",
      strength: "moderate",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "n2",
      workspaceId: "m1",
      missionId: "mission-1",
      type: "observation",
      content: "NOAA 2024 Report on Arctic Melt Rates",
      strength: "strong",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "n3",
      workspaceId: "m1",
      missionId: "mission-1",
      type: "observation",
      content: "Sentinel-6 Satellite Altimetry Data",
      strength: "strong",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "n4",
      workspaceId: "m1",
      missionId: "mission-1",
      type: "claim",
      content: "Melting rate exceeds previous IPPC models",
      strength: "moderate",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Scenario B
    {
      id: "n5",
      workspaceId: "m2",
      missionId: "mission-2",
      type: "hypothesis",
      content: "Suez blockage causes 2-week semiconductor delay",
      strength: "moderate",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "n6",
      workspaceId: "m2",
      missionId: "mission-2",
      type: "observation",
      content: "Port authority live congestion report",
      strength: "strong",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "n7",
      workspaceId: "m2",
      missionId: "mission-2",
      type: "claim",
      content: "Reroute via Cape of Good Hope reduces delay risk",
      strength: "moderate",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Scenario C
    {
      id: "n8",
      workspaceId: "m3",
      missionId: "mission-3",
      type: "hypothesis",
      content: "Mandatory human approval prevents runaway loops",
      strength: "strong",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "n9",
      workspaceId: "m3",
      missionId: "mission-3",
      type: "claim",
      content: "Adaptive thresholds minimize latency impact",
      strength: "moderate",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Scenario D
    {
      id: "n10",
      workspaceId: "m4",
      missionId: "mission-4",
      type: "observation",
      content: "Transformer vs SSM Comparative Study 2025",
      strength: "strong",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "n11",
      workspaceId: "m4",
      missionId: "mission-4",
      type: "claim",
      content: "Hybrid SSM-Transformer block is optimal for edge devices",
      strength: "moderate",
      metadata: {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const baseEdges: EpistemicEdge[] = [
    {
      id: "e1",
      workspaceId: "m1",
      sourceNodeId: "n2",
      targetNodeId: "n1",
      type: "supports",
      metadata: {},
      createdAt: new Date(),
    },
    {
      id: "e2",
      workspaceId: "m1",
      sourceNodeId: "n3",
      targetNodeId: "n1",
      type: "supports",
      metadata: {},
      createdAt: new Date(),
    },
    {
      id: "e3",
      workspaceId: "m1",
      sourceNodeId: "n4",
      targetNodeId: "n2",
      type: "refines",
      metadata: {},
      createdAt: new Date(),
    },
    {
      id: "e4",
      workspaceId: "m2",
      sourceNodeId: "n6",
      targetNodeId: "n5",
      type: "supports",
      metadata: {},
      createdAt: new Date(),
    },
    {
      id: "e5",
      workspaceId: "m2",
      sourceNodeId: "n7",
      targetNodeId: "n5",
      type: "addresses",
      metadata: {},
      createdAt: new Date(),
    },
  ];

  const sources: Source[] = [
    new Source({
      id: "s1",
      workspaceId: "m6",
      missionId: "mission-6",
      sourceType: "repo_file",
      title: "Event Sourcing Draft ADR",
      sourceQuality: "high",
      content:
        "Proposed decision to adopt Event Sourcing for all mission history.",
      metadata: {
        url: "fixtures/adr-review/event-sourcing-draft.md",
        author: "architect",
      },
      createdAt: new Date(),
    }),
  ];

  return {
    workspaces,
    nodes: [
      ...baseNodes.map((n) => new EpistemicNode(n as EpistemicNodeProps)),
      ...workspaceE.nodes,
      ...russianDemo.nodes,
    ],
    edges: [...baseEdges, ...workspaceE.edges, ...russianDemo.edges],
    sources,
  };
}
