"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconLoader2, IconTrash } from "@tabler/icons-react"
import {
  displayModelLabel,
  isValidOpenRouterModelId,
} from "@/lib/ai/openrouter-models"
import type { SavedOpenRouterModel } from "@/lib/ai/saved-openrouter-models"
import { cn } from "@/lib/utils"

type AiSettingsFormProps = {
  initialChatModel: string
  initialChatEnabled: boolean
  initialModels: SavedOpenRouterModel[]
  openRouterConfigured: boolean
}

export function AiSettingsForm({
  initialChatModel,
  initialChatEnabled,
  initialModels,
  openRouterConfigured,
}: AiSettingsFormProps) {
  const [chatModel, setChatModel] = useState(initialChatModel)
  const [chatEnabled, setChatEnabled] = useState(initialChatEnabled)
  const [models, setModels] = useState(initialModels)
  const [newModelId, setNewModelId] = useState("")
  const [newModelLabel, setNewModelLabel] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const saveSettings = async (next: {
    chatModel?: string
    chatEnabled?: boolean
  }) => {
    const response = await fetch("/api/admin/ai-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatModel: next.chatModel ?? chatModel,
        chatEnabled: next.chatEnabled ?? chatEnabled,
      }),
    })
    const result = (await response.json()) as { error?: string }
    if (!response.ok) {
      throw new Error(result.error ?? "Unable to save AI settings.")
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setIsSubmitting(true)

    try {
      await saveSettings({})
      setMessage("Settings saved.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save AI settings.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onAddModel = async () => {
    setError("")
    setMessage("")
    const modelId = newModelId.trim()
    if (!isValidOpenRouterModelId(modelId)) {
      setError("Enter a valid OpenRouter model id (e.g. openai/gpt-4o-mini).")
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch("/api/admin/openrouter-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId,
          label: newModelLabel.trim() || undefined,
        }),
      })
      const result = (await response.json()) as {
        error?: string
        data?: SavedOpenRouterModel
      }
      if (!response.ok || !result.data) {
        setError(result.error ?? "Unable to add model.")
        return
      }
      setModels((current) => [...current, result.data!])
      setNewModelId("")
      setNewModelLabel("")
      setMessage("Model added.")
    } catch {
      setError("Unable to add model.")
    } finally {
      setIsAdding(false)
    }
  }

  const onToggleActiveModel = async (modelId: string) => {
    if (chatModel === modelId) return
    setError("")
    setMessage("")
    const previous = chatModel
    setChatModel(modelId)
    try {
      await saveSettings({ chatModel: modelId })
      setMessage("Active model updated.")
    } catch (err) {
      setChatModel(previous)
      setError(err instanceof Error ? err.message : "Unable to update active model.")
    }
  }

  const onRemoveModel = async (id: string) => {
    setError("")
    setMessage("")
    setRemovingId(id)
    try {
      const response = await fetch(`/api/admin/openrouter-models/${id}`, {
        method: "DELETE",
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error ?? "Unable to remove model.")
        return
      }

      const removed = models.find((m) => m.id === id)
      const nextModels = models.filter((m) => m.id !== id)
      setModels(nextModels)

      if (removed && chatModel === removed.modelId) {
        const nextActive = nextModels[0]?.modelId ?? ""
        setChatModel(nextActive)
        if (nextActive) {
          await saveSettings({ chatModel: nextActive })
        }
      }
      setMessage("Model removed.")
    } catch {
      setError("Unable to remove model.")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-border p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Portfolio chat</h2>
        <p className="text-sm text-muted-foreground">
          Add OpenRouter models you use, then check the one to serve the public
          Ask tab. Answers are limited to published portfolio content.
        </p>
        {!openRouterConfigured ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Set <code className="text-xs">OPENROUTER_API_KEY</code> in your environment
            to enable chat.
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={chatEnabled}
          onChange={(e) => setChatEnabled(e.target.checked)}
          disabled={!openRouterConfigured}
          className="size-4 rounded border border-border"
        />
        Enable public portfolio chat
      </label>

      <div className="space-y-3">
        <p className="text-sm font-medium">Your models</p>
        <p className="text-xs text-muted-foreground">
          Copy model ids from{" "}
          <a
            href="https://openrouter.ai/models"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            openrouter.ai/models
          </a>
          . Check the model to use for chat.
        </p>

        {models.length === 0 ? (
          <p className="text-sm text-muted-foreground">No models yet.</p>
        ) : (
          <ul className="space-y-2">
            {models.map((model) => {
              const isActive = chatModel === model.modelId
              return (
                <li
                  key={model.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2",
                    isActive ? "border-primary/50 bg-primary/5" : "border-border",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => void onToggleActiveModel(model.modelId)}
                    disabled={!openRouterConfigured}
                    className="size-4 shrink-0 rounded border border-border"
                    aria-label={`Use ${displayModelLabel(model.modelId, model.label)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {displayModelLabel(model.modelId, model.label)}
                    </p>
                    {model.label ? (
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {model.modelId}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={removingId === model.id}
                    onClick={() => void onRemoveModel(model.id)}
                    aria-label={`Remove ${model.modelId}`}
                  >
                    {removingId === model.id ? (
                      <IconLoader2 className="size-4 animate-spin" />
                    ) : (
                      <IconTrash className="size-4" />
                    )}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
        <p className="text-sm font-medium">Add model</p>
        <div className="space-y-2">
          <Input
            value={newModelId}
            onChange={(e) => setNewModelId(e.target.value)}
            placeholder="openai/gpt-4o-mini"
            disabled={!openRouterConfigured || isAdding}
            className="font-mono text-sm"
          />
          <Input
            value={newModelLabel}
            onChange={(e) => setNewModelLabel(e.target.value)}
            placeholder="Display name (optional)"
            disabled={!openRouterConfigured || isAdding}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={!openRouterConfigured || isAdding || !newModelId.trim()}
          onClick={() => void onAddModel()}
        >
          {isAdding ? (
            <>
              <IconLoader2 className="size-4 animate-spin" aria-hidden />
              Adding…
            </>
          ) : (
            "Add model"
          )}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <Button type="submit" disabled={isSubmitting || !openRouterConfigured}>
        {isSubmitting ? (
          <>
            <IconLoader2 className="size-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          "Save chat enabled"
        )}
      </Button>
    </form>
  )
}
