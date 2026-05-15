import type { ComponentType } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type BaseContactFieldProps = {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  className?: string
}

type InputContactFieldProps = BaseContactFieldProps & {
  multiline?: false
} & Omit<React.ComponentProps<typeof Input>, "id" | "className">

type TextareaContactFieldProps = BaseContactFieldProps & {
  multiline: true
} & Omit<React.ComponentProps<typeof Textarea>, "id" | "className">

type ContactFieldProps = InputContactFieldProps | TextareaContactFieldProps

export function ContactField(props: ContactFieldProps) {
  const { id, label, icon: Icon, multiline = false, className, ...controlProps } =
    props

  const controlClassName = cn(
    "h-10 pl-9",
    multiline && "min-h-32 h-auto resize-y py-2.5",
    className,
  )

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon
          className={cn(
            "pointer-events-none absolute left-3 size-4 text-muted-foreground",
            multiline ? "top-3" : "top-1/2 -translate-y-1/2",
          )}
          aria-hidden
        />
        {multiline ? (
          <Textarea
            id={id}
            className={controlClassName}
            {...(controlProps as React.ComponentProps<typeof Textarea>)}
          />
        ) : (
          <Input
            id={id}
            className={controlClassName}
            {...(controlProps as React.ComponentProps<typeof Input>)}
          />
        )}
      </div>
    </div>
  )
}
