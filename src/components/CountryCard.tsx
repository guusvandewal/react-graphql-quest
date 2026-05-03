/**
 * <CountryCard /> — purely presentational. Receives one Country, renders it.
 * Notice how the prop type comes straight from `types.ts`.
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Country } from "@/types";

export function CountryCard({ country }: { country: Country }) {
  return (
    <Card className="p-5 shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start gap-3">
        <span className="text-4xl leading-none" aria-hidden>{country.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">{country.name}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {country.capital ?? "No capital"} · {country.currency ?? "—"}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="secondary">{country.continent.name}</Badge>
        {country.languages.slice(0, 3).map((l) => (
          <Badge key={l.code} variant="outline">{l.name}</Badge>
        ))}
      </div>
    </Card>
  );
}
