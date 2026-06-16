import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import {
  createRiskProfilerApp,
  createRiskProfilerService,
} from '../src/index.js';

describe('createRiskProfilerApp', () => {
  let engine: RiskProfilerEngine;
  let app: ReturnType<typeof createRiskProfilerApp>;

  beforeAll(() => {
    engine = new RiskProfilerEngine();
    app = createRiskProfilerApp({ engine });
  });

  afterAll(() => {
    engine.dispose();
  });

  it('reports health', async () => {
    const response = await app.request('/health');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  it('serves the default questionnaire', async () => {
    const response = await app.request('/questions');
    const questions = await response.json();

    expect(response.status).toBe(200);
    expect(questions).toHaveLength(7);
  });

  it('evaluates a valid applicant', async () => {
    const response = await app.request('/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        answers: {
          investmentHorizonYears: 10,
          riskAttitude: 'hold',
          investmentObjective: 'balanced_growth',
          annualIncome: 55_000,
          dtiRatio: 20,
          liquidityMonths: 2,
          investmentExperience: 'beginner',
        },
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      rawScore: 34,
      normalizedScore: 60.71,
      profile: {
        id: 'moderate',
        label: 'Moderate',
      },
      overrideApplied: false,
    });
  });

  it('returns a conservative profile for the DTI override', async () => {
    const response = await app.request('/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        answers: {
          investmentHorizonYears: 20,
          riskAttitude: 'buy_more',
          investmentObjective: 'maximum_growth',
          annualIncome: 180_000,
          dtiRatio: 50,
          liquidityMonths: 8,
          investmentExperience: 'experienced',
        },
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      profile: {
        id: 'conservative',
        label: 'Conservative',
      },
      overrideApplied: true,
    });
  });

  it('returns structured validation errors', async () => {
    const response = await app.request('/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        answers: {
          dtiRatio: 150,
        },
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toMatchObject({
      error: {
        code: 'validation_error',
      },
    });
  });

  it('evaluates a batch and preserves per-item errors', async () => {
    const response = await app.request('/evaluate/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            applicantId: 'APP-001',
            answers: {
              investmentHorizonYears: 10,
              riskAttitude: 'hold',
              investmentObjective: 'balanced_growth',
              annualIncome: 55_000,
              dtiRatio: 20,
              liquidityMonths: 2,
              investmentExperience: 'beginner',
            },
          },
          {
            applicantId: 'APP-002',
            answers: {
              dtiRatio: 150,
            },
          },
        ],
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      summary: {
        total: 2,
        fulfilled: 1,
        rejected: 1,
      },
      items: [
        {
          index: 0,
          applicantId: 'APP-001',
          status: 'fulfilled',
          result: {
            profile: {
              label: 'Moderate',
            },
          },
        },
        {
          index: 1,
          applicantId: 'APP-002',
          status: 'rejected',
          error: {
            code: 'validation_error',
          },
        },
      ],
    });
  });

  it('rejects batch requests above the configured limit', async () => {
    const limitedApp = createRiskProfilerApp({
      engine,
      maxBatchSize: 1,
    });
    const response = await limitedApp.request('/evaluate/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            answers: {
              dtiRatio: 20,
            },
          },
          {
            answers: {
              dtiRatio: 30,
            },
          },
        ],
      }),
    });
    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toMatchObject({
      error: {
        code: 'validation_error',
        message: 'Batch size 2 exceeds the maximum of 1.',
      },
    });
  });

  it('exposes explicit lifecycle ownership through the service API', async () => {
    const service = createRiskProfilerService();
    service.dispose();

    await expect(
      service.engine.evaluate({
        answers: {
          investmentHorizonYears: 10,
          riskAttitude: 'hold',
          investmentObjective: 'balanced_growth',
          annualIncome: 55_000,
          dtiRatio: 20,
          liquidityMonths: 2,
          investmentExperience: 'beginner',
        },
      }),
    ).rejects.toThrow('disposed');
  });
});
