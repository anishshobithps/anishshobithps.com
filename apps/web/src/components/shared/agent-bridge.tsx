"use client";

import { useEffect } from "react";
import { createAgent, registerTools, type AgentAction } from "@ui-sdk/react/agent";

export function allowAgentStep(
  step: Pick<AgentAction, "confirm">,
  ask: (message: string) => boolean = (message) => window.confirm(message),
) {
  return step.confirm ? ask(`An assistant wants to: ${step.confirm}. Allow it?`) : true;
}

export function AgentBridge() {
  useEffect(() => {
    const agent = createAgent();
    return registerTools(agent, { allow: (step) => allowAgentStep(step) });
  }, []);

  return null;
}
