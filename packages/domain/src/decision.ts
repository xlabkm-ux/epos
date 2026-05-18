import { ActorRef } from "./mission.js";

export type DecisionType =
  | "human_choice"
  | "approval"
  | "rejection"
  | "edit_then_approve"
  | "policy_downgrade"
  | "policy_deny"
  | "system_default";

export type DecisionOption = {
  optionId: string;
  label: string;
  description?: string;
  consequence?: string;
  riskClass?: "low" | "medium" | "high" | "critical";
};

export interface DecisionRecordProps {
  id: string;
  missionId: string;
  runId?: string;
  decisionType: DecisionType;
  subjectType: "node" | "edge" | "patch" | "tool_call" | "mission" | "artifact";
  subjectRef: string;
  options: DecisionOption[];
  selectedOptionId?: string;
  rationale?: string;
  actor: ActorRef;
  createdAt: Date;
}

export class DecisionRecord {
  private props: DecisionRecordProps;

  constructor(props: DecisionRecordProps) {
    this.props = { ...props };
  }

  get id() { return this.props.id; }
  get selectedOptionId() { return this.props.selectedOptionId; }

  public toProps(): DecisionRecordProps { return { ...this.props }; }
}
