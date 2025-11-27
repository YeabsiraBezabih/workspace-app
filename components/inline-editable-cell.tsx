"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface InlineEditableCellProps {
  value: string | number;
  onSave: (value: string | number) => Promise<void>;
  type?: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  className?: string;
}

export function InlineEditableCell({
  value,
  onSave,
  type = "text",
  options,
  className,
}: InlineEditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (type === "select" && options) {
    return (
      <Select
        value={String(editValue)}
        onValueChange={async (newValue) => {
          setEditValue(newValue);
          setIsSaving(true);
          try {
            await onSave(newValue);
          } catch (error) {
            console.error("Failed to save:", error);
            setEditValue(value);
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <SelectTrigger
          className={cn(
            "h-8 border-0 bg-transparent hover:bg-muted/50 focus:ring-0",
            isSaving && "opacity-50",
            className
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) =>
          setEditValue(type === "number" ? Number(e.target.value) : e.target.value)
        }
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("h-8 px-2 w-16 max-w-20", className)}
        disabled={isSaving}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer rounded px-2 py-1 hover:bg-muted/50",
        isSaving && "opacity-50",
        className
      )}
    >
      {value}
    </div>
  );
}
