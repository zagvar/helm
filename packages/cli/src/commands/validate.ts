import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { intro, log, outro, spinner } from '@clack/prompts';
import { defineCommand } from 'citty';
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import { loadDefinition } from '../utils/definition.js';
import { createFileSystemLoader } from '../utils/loader.js';

export default defineCommand({
  meta: {
    name: 'validate',
    description: 'Validate a JDM decision graph file',
  },
  args: {
    jdm: {
      type: 'string',
      description: 'Path to the JDM JSON file to validate',
      required: true,
    },
    definition: {
      type: 'string',
      description: 'Definition that declares the custom JDM contract',
    },
    input: {
      type: 'string',
      description: 'Sample evaluation input used to verify the graph contract',
    },
  },
  run: async ({ args }) => {
    intro('JDM Validation');

    const s = spinner();
    s.start(`Validating ${args.jdm}...`);

    let engine: RiskProfilerEngine | undefined;
    try {
      const raw = await readFile(resolve(process.cwd(), args.jdm), 'utf-8');

      // Step 1 — valid JSON
      let graph: unknown;
      try {
        graph = JSON.parse(raw);
      } catch {
        s.stop('Failed.');
        log.error('File is not valid JSON.');
        process.exit(1);
        return;
      }

      // Step 2 — expected JDM structure
      if (
        typeof graph !== 'object' ||
        graph === null ||
        !Array.isArray((graph as Record<string, unknown>)['nodes']) ||
        !Array.isArray((graph as Record<string, unknown>)['edges'])
      ) {
        s.stop('Failed.');
        log.error(
          'File does not have a valid JDM structure. ' +
            'Expected "nodes" and "edges" arrays at the root.',
        );
        process.exit(1);
        return;
      }

      // ZenEngine validates graph structure independently of the business contract.
      const loader = createFileSystemLoader(args.jdm);
      const definition =
        args.definition !== undefined
          ? await loadDefinition(args.definition)
          : undefined;
      engine = new RiskProfilerEngine({
        loader,
        ...(definition !== undefined && { definition }),
      });
      await engine.validate();

      if (args.input !== undefined) {
        const sample = JSON.parse(
          await readFile(resolve(process.cwd(), args.input), 'utf8'),
        ) as Record<string, unknown>;
        await engine.evaluate(sample);
      } else if (definition === undefined) {
        await engine.evaluate({
          answers: {
            investmentHorizonYears: 10,
            riskAttitude: 'hold',
            investmentObjective: 'balanced_growth',
            annualIncome: 75_000,
            dtiRatio: 20,
            liquidityMonths: 4,
            investmentExperience: 'intermediate',
          },
        });
      } else {
        log.warn(
          'Graph structure is valid. Pass --input to verify the custom output contract.',
        );
      }

      s.stop('Valid.');
      log.success(`${args.jdm} is a valid JDM graph.`);
      outro('Validation complete.');
    } catch (err) {
      s.stop('Failed.');
      log.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    } finally {
      engine?.dispose();
    }
  },
});
