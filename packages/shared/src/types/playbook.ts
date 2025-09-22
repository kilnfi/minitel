import type { ProtocolAdapter } from './protocol-adapter';

export interface PlaybookOperationOverviewItem {
  type: 'text';
  content: string;
}

export interface PlaybookStepByStepItem {
  title: string;
  program: string;
  description: string;
}

export interface PlaybookOperation {
  label: string;
  value: string;
  description: string;
  rawTransaction: string;
  operationOverview: PlaybookOperationOverviewItem[];
  stepByStep?: PlaybookStepByStepItem[];
}

export interface PlaybookConfig<T> {
  protocolName: string;
  operations: PlaybookOperation[];
  adapter: ProtocolAdapter<T>;
}
