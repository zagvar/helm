import Link from "next/link";
import { Code2, FileText } from "lucide-react";
import { ProductMotionPreview } from "./_components/ProductMotionPreview";
import { SiteHeader } from "./_components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Helm",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: "https://helmdoc.vercel.app",
  codeRepository: "https://github.com/zagvar/helm",
  creator: {
    "@type": "Organization",
    name: "Zagvar",
    url: "https://github.com/zagvar",
  },
  description:
    "Rules-based investment profiling and portfolio allocation engine with JSON, CSV, REST, and CLI evaluation flows.",
};

const capabilities = [
  {
    title: "Definition-driven",
    description:
      "Questions, scoring, weights, bands, overrides, and allocations are modeled in versioned definitions.",
    icon: FileText,
  },
  {
    title: "Integration-ready",
    description:
      "Embed the core engine, expose Hono REST endpoints, or run evaluations through the CLI.",
    icon: Code2,
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-8 lg:px-10">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">
              Helm
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              Rules-based investment profiling and portfolio allocation.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Use the default model immediately, customize the definition when
              your policy differs, and evaluate applicants through TypeScript,
              REST, CLI, JSON, or CSV batch flows.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/docs">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/demo">Open Demo</Link>
              </Button>
            </div>
            <div
              aria-label="Capabilities"
              className="mt-8 grid gap-3 sm:grid-cols-2"
            >
              {capabilities.map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <item.icon
                      aria-hidden="true"
                      className="size-5 text-primary mb-1"
                    />
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workflow preview</CardTitle>
              <CardDescription>
                An illustrative UI showing how teams can batch-evaluate
                applicants and apply custom definitions with Helm underneath.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductMotionPreview />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
