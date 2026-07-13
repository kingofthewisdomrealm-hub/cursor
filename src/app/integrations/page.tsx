"use client";

import { useEffect, useState } from "react";
import type { ConnectedIntegration } from "@/types/integration";
import {
  connectApp,
  getAllIntegrations,
  toggleIntegration,
  updateIntegrationConfig,
} from "@/lib/integration-store";
import { INTEGRATION_APPS, CAPABILITY_LABELS } from "@/lib/integrations/registry";
import {
  Brain,
  Mail,
  Plug,
  Search,
  Share2,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import Link from "next/link";

const ICONS: Record<string, React.ReactNode> = {
  brain: <Brain className="h-5 w-5" />,
  search: <Search className="h-5 w-5" />,
  mail: <Mail className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  share: <Share2 className="h-5 w-5" />,
  webhook: <Webhook className="h-5 w-5" />,
};

export default function IntegrationsPage() {
  const [connected, setConnected] = useState<ConnectedIntegration[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookKey, setWebhookKey] = useState("");

  const refresh = () => setConnected(getAllIntegrations());

  useEffect(() => {
    refresh();
  }, []);

  const isConnected = (appId: string) =>
    connected.some((c) => c.app_id === appId && c.enabled);

  const handleToggle = (appId: string) => {
    const existing = connected.find((c) => c.app_id === appId);
    if (existing) {
      toggleIntegration(existing.id, !existing.enabled);
    } else {
      connectApp(appId);
    }
    refresh();
  };

  const handleWebhookConnect = () => {
    const entry = connectApp("custom-webhook", {
      webhook_url: webhookUrl,
      api_key: webhookKey || undefined,
    });
    if (entry) refresh();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
          <Plug className="h-3.5 w-3.5" />
          AI App Network
        </div>
        <h1 className="text-3xl font-black text-white">Connected AI Apps</h1>
        <p className="mt-2 text-zinc-400 max-w-xl">
          Connect specialized AI apps to execute mission tasks — research, outreach,
          prospect lists, and more. External actions always require your approval.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold text-cyan-300">
            {connected.filter((c) => c.enabled).length} apps active
          </span>
        </div>
        <p className="text-sm text-zinc-400">
          On any task, tap <strong className="text-white">Run with AI App</strong> to
          delegate work to a connected agent.
        </p>
      </div>

      <div className="space-y-4">
        {INTEGRATION_APPS.map((app) => {
          const active = isConnected(app.id);
          const conn = connected.find((c) => c.app_id === app.id);

          return (
            <div
              key={app.id}
              className={`rounded-2xl border p-5 transition-colors ${
                active
                  ? "border-cyan-500/30 bg-cyan-950/10"
                  : "border-zinc-800/80 bg-zinc-900/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                      active
                        ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-400"
                    }`}
                  >
                    {ICONS[app.icon] ?? <Plug className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{app.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{app.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {app.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400"
                        >
                          {CAPABILITY_LABELS[cap] ?? cap}
                        </span>
                      ))}
                    </div>
                    {app.requires_approval && (
                      <p className="mt-2 text-[11px] text-purple-400">
                        Requires approval before external actions
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(app.id)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  {active ? "Connected" : "Connect"}
                </button>
              </div>

              {app.id === "custom-webhook" && active && conn && (
                <div className="mt-4 space-y-3 border-t border-zinc-800/80 pt-4">
                  <input
                    type="url"
                    placeholder="Webhook URL (https://your-ai-app.com/hook)"
                    value={webhookUrl || conn.config.webhook_url || ""}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="API key (optional)"
                    value={webhookKey}
                    onChange={(e) => setWebhookKey(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      updateIntegrationConfig(conn.id, {
                        webhook_url: webhookUrl || conn.config.webhook_url,
                        api_key: webhookKey || conn.config.api_key,
                      });
                      refresh();
                    }}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    Save webhook settings
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">
          How it works
        </h2>
        <ol className="space-y-3 text-sm text-zinc-400">
          <li>
            <span className="text-cyan-500 font-mono mr-2">1.</span>
            Connect the AI apps you want to use for mission work
          </li>
          <li>
            <span className="text-cyan-500 font-mono mr-2">2.</span>
            Outcome Agent matches each task to the best app automatically
          </li>
          <li>
            <span className="text-cyan-500 font-mono mr-2">3.</span>
            Tap <strong className="text-white">Run with AI App</strong> on a task to
            delegate execution
          </li>
          <li>
            <span className="text-cyan-500 font-mono mr-2">4.</span>
            Review output, approve if needed, then complete the task
          </li>
        </ol>
      </div>

      <Link
        href="/"
        className="mt-8 block text-center text-sm text-cyan-400 hover:text-cyan-300"
      >
        ← Back to Mission Control
      </Link>
    </div>
  );
}
