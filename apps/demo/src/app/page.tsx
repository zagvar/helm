import { DemoTabs } from "./_components/DemoTabs";
import { riskProfilerEngine } from "@/lib/risk-profiler";

export default function Home() {
  const activeDefinition = riskProfilerEngine.definition;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="max-w-3xl">
          <p className="text-md font-bold uppercase tracking-wide text-slate-700">
            Invespro Demo
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            Investment Profiling and Portfolio Allocation
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Invespro is a rules-based investment profiling and portfolio
            allocation engine with a default model, versioned customization, and
            ready-to-use CLI/REST integrations.
          </p>
        </header>

        <DemoTabs activeDefinition={activeDefinition} />
      </div>
    </main>
  );
}
