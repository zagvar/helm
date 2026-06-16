import type { RiskProfileDefinitionInput } from "@vibedcoder/invespro-types";

type SelectOption = {
  readonly label: string;
  readonly value: string;
};

type DemoAnswers = {
  readonly investmentHorizonYears: number;
  readonly riskAttitude: string;
  readonly investmentObjective: string;
  readonly annualIncome: number;
  readonly dtiRatio: number;
  readonly liquidityMonths: number;
  readonly investmentExperience: string;
};

type DemoApplicant = {
  readonly applicantId: string;
  readonly answers: DemoAnswers;
};

export const riskAttitudeOptions: SelectOption[] = [
  { label: "Buy more - capitalise on lower prices", value: "buy_more" },
  { label: "Hold - wait for recovery", value: "hold" },
  { label: "Sell some - move to safer assets", value: "sell_some" },
  { label: "Sell all - prevent further losses", value: "sell_all" },
];

export const objectiveOptions: SelectOption[] = [
  { label: "Maximum Growth", value: "maximum_growth" },
  { label: "Balanced Growth", value: "balanced_growth" },
  { label: "Income Generation", value: "income_generation" },
  { label: "Capital Preservation", value: "capital_preservation" },
];

export const experienceOptions: SelectOption[] = [
  { label: "Experienced - 5+ years", value: "experienced" },
  { label: "Intermediate - 2-5 years", value: "intermediate" },
  { label: "Beginner - under 2 years", value: "beginner" },
  { label: "None", value: "none" },
];

export const defaultAnswers = {
  applicantId: "APP-001",
  investmentHorizonYears: 10,
  riskAttitude: "hold",
  investmentObjective: "balanced_growth",
  annualIncome: 95000,
  dtiRatio: 22,
  liquidityMonths: 4,
  investmentExperience: "intermediate",
};

export const batchSample = {
  items: [
    {
      applicantId: "APP-001",
      answers: {
        investmentHorizonYears: 10,
        riskAttitude: "hold",
        investmentObjective: "balanced_growth",
        annualIncome: 95000,
        dtiRatio: 22,
        liquidityMonths: 4,
        investmentExperience: "intermediate",
      },
    },
    {
      applicantId: "APP-002",
      answers: {
        investmentHorizonYears: 18,
        riskAttitude: "buy_more",
        investmentObjective: "maximum_growth",
        annualIncome: 180000,
        dtiRatio: 12,
        liquidityMonths: 8,
        investmentExperience: "experienced",
      },
    },
    {
      applicantId: "APP-003",
      answers: {
        investmentHorizonYears: 2,
        riskAttitude: "sell_all",
        investmentObjective: "capital_preservation",
        annualIncome: 48000,
        dtiRatio: 52,
        liquidityMonths: 1,
        investmentExperience: "none",
      },
    },
  ] satisfies readonly DemoApplicant[],
};

export const batchSampleJson = JSON.stringify(batchSample, null, 2);

export const customDefinitionExample = {
  schemaVersion: "1.0",
  id: "demoCustomProfiler",
  name: "Demo Custom Investment Profiler",
  version: "0.1.0",
  currency: "AUD",
  questions: [
    {
      id: "investmentGoal",
      text: "What is the applicant's primary investment goal?",
      purpose: "scored",
      required: true,
      type: "select",
      options: [
        { label: "Protect capital", value: "protectCapital" },
        { label: "Balanced growth and income", value: "balancedIncome" },
        { label: "Long-term growth", value: "longTermGrowth" },
      ],
    },
    {
      id: "downturnResponse",
      text: "What would the applicant do after a 20% market fall?",
      purpose: "scored",
      required: true,
      type: "select",
      options: [
        { label: "Move to cash", value: "moveToCash" },
        { label: "Hold the portfolio", value: "holdPortfolio" },
        { label: "Rebalance or invest more", value: "rebalance" },
      ],
    },
    {
      id: "horizonYears",
      text: "How many years can the applicant stay invested?",
      purpose: "scored",
      required: true,
      type: "number",
      min: 0,
      max: 50,
      unit: "years",
    },
    {
      id: "ethicalPreference",
      text: "Does the applicant prefer ethical investment options?",
      purpose: "informational",
      required: false,
      type: "boolean",
    },
  ],
  scoring: [
    {
      questionId: "downturnResponse",
      weight: 45,
      rules: [
        { type: "option", value: "moveToCash", score: 2 },
        { type: "option", value: "holdPortfolio", score: 6 },
        { type: "option", value: "rebalance", score: 10 },
      ],
    },
    {
      questionId: "horizonYears",
      weight: 35,
      rules: [
        { type: "range", max: 3, score: 2 },
        { type: "range", min: 3, max: 7, score: 6 },
        { type: "range", min: 7, score: 10 },
      ],
    },
    {
      questionId: "investmentGoal",
      weight: 20,
      rules: [
        { type: "option", value: "protectCapital", score: 2 },
        { type: "option", value: "balancedIncome", score: 6 },
        { type: "option", value: "longTermGrowth", score: 10 },
      ],
    },
  ],
  profiles: [
    { id: "cautious", label: "Cautious", order: 0 },
    { id: "balanced", label: "Balanced", order: 1 },
    { id: "growth", label: "Growth", order: 2 },
  ],
  scoreBands: [
    { profileId: "growth", minScore: 70 },
    { profileId: "balanced", minScore: 40 },
    { profileId: "cautious", minScore: 0 },
  ],
  assetClasses: [
    { id: "equities", label: "Equities" },
    { id: "fixedIncome", label: "Fixed Income" },
    { id: "cash", label: "Cash" },
  ],
  allocations: {
    cautious: { equities: 25, fixedIncome: 55, cash: 20 },
    balanced: { equities: 55, fixedIncome: 35, cash: 10 },
    growth: { equities: 80, fixedIncome: 15, cash: 5 },
  },
  overrides: [],
} satisfies RiskProfileDefinitionInput;

export const customEvaluationSample = {
  applicantId: "CUSTOM-001",
  answers: {
    investmentGoal: "longTermGrowth",
    downturnResponse: "rebalance",
    horizonYears: 12,
    ethicalPreference: true,
  },
};

export const customDefinitionJson = JSON.stringify(
  customDefinitionExample,
  null,
  2,
);

export const customEvaluationJson = JSON.stringify(
  customEvaluationSample,
  null,
  2,
);

export type { SelectOption };
