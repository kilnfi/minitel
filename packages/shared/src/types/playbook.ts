import type { ProtocolAdapter } from './protocol-adapter';

export type PlaybookOperationOverviewItem = {
  type: 'text';
  content: string;
};

export type PlaybookStepByStepItem = {
  title: string;
  program: string;
  description: string;
};

export type PlaybookOperation = {
  label: string;
  value: string;
  description: string;
  rawTransaction: string;
  operationOverview: PlaybookOperationOverviewItem[];
  stepByStep?: PlaybookStepByStepItem[];
};

export type PlaybookConfig<T> = {
  protocolName: string;
  operations: PlaybookOperation[];
  adapter: ProtocolAdapter<T>;
};
