/**
 * <Challenge /> — a small interactive quiz card.
 *
 * Props use a discriminated-style shape: a question, several options, and the
 * index of the correct answer. State is local (no backend needed).
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function Challenge({ question, options, correctIndex, explanation }: ChallengeProps) {
  const [picked, setPicked] = useState<number | null>(null);
  const isCorrect = picked === correctIndex;
  const answered = picked !== null;

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <p className="font-semibold mb-4 text-foreground">{question}</p>
      <div className="grid gap-2">
        {options.map((opt, i) => {
          const showCorrect = answered && i === correctIndex;
          const showWrong = answered && i === picked && i !== correctIndex;
          return (
            <button
              key={i}
              onClick={() => !answered && setPicked(i)}
              disabled={answered}
              className={cn(
                "text-left px-4 py-2.5 rounded-md border transition-colors font-mono text-sm",
                "hover:bg-muted disabled:cursor-not-allowed",
                showCorrect && "border-success bg-success/10 text-success",
                showWrong && "border-destructive bg-destructive/10 text-destructive",
                !answered && "border-border",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-4 flex gap-2 items-start text-sm">
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          )}
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {isCorrect ? "Correct! " : "Not quite. "}
            </span>
            {explanation}
          </p>
        </div>
      )}
      {answered && (
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => setPicked(null)}>
          Try again
        </Button>
      )}
    </Card>
  );
}
