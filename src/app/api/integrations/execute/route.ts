import { NextRequest, NextResponse } from "next/server";
import { executeWork } from "@/lib/integrations/executor";
import { getDefaultIntegrationsForApi } from "@/lib/integration-store";
import { matchIntegrationForTask } from "@/lib/integrations/matcher";
import type {
  ConnectedIntegration,
  IntegrationCapability,
  WorkRequest,
} from "@/types/integration";
import type { Task } from "@/types/mission";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mission_id,
      task_id,
      integration_id,
      app_id,
      capability,
      mission_title,
      outcome_text,
      task,
      integrations: clientIntegrations,
    } = body as {
      mission_id: string;
      task_id: string;
      integration_id?: string;
      app_id?: string;
      capability?: IntegrationCapability;
      mission_title: string;
      outcome_text: string;
      task: Task;
      integrations?: ConnectedIntegration[];
    };

    if (!mission_id || !task_id || !task?.title) {
      return NextResponse.json(
        { error: "mission_id, task_id, and task are required" },
        { status: 400 }
      );
    }

    const integrations: ConnectedIntegration[] =
      clientIntegrations?.length
        ? clientIntegrations
        : getDefaultIntegrationsForApi();

    let integration: ConnectedIntegration | undefined;
    let matchedCapability = capability;

    if (integration_id) {
      integration = integrations.find((i) => i.id === integration_id);
    } else if (app_id) {
      integration = integrations.find((i) => i.app_id === app_id && i.enabled);
    } else {
      const match = matchIntegrationForTask(task, integrations, capability);
      integration = match?.integration;
      matchedCapability = match?.capability;
    }

    if (!integration) {
      return NextResponse.json(
        { error: "No connected integration available for this task" },
        { status: 400 }
      );
    }

    const workRequest: WorkRequest = {
      mission_id,
      task_id,
      integration_id: integration.id,
      app_id: integration.app_id,
      capability: matchedCapability ?? "general_execution",
      mission_title: mission_title ?? "Mission",
      outcome_text: outcome_text ?? "",
      task: {
        title: task.title,
        description: task.description,
        reason: task.reason,
        instructions: task.instructions,
        suggested_content: task.suggested_content,
        expected_result: task.expected_result,
      },
    };

    const result = await executeWork(workRequest, integration);

    return NextResponse.json({
      result,
      integration: {
        id: integration.id,
        app_id: integration.app_id,
        name: integration.name,
      },
      capability: workRequest.capability,
    });
  } catch (error) {
    console.error("Integration execute error:", error);
    return NextResponse.json(
      { error: "Failed to execute task via integration" },
      { status: 500 }
    );
  }
}
