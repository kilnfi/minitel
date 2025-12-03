import type { Protocol } from '@protocols/shared';
import { CheckIcon, ChevronsUpDownIcon, ExternalLinkIcon, PanelRightIcon } from 'lucide-react';
import { DataTests } from '../lib/data-tests';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Toggle } from './ui/toggle';

type HeaderProps = {
  protocols: Protocol[];
  currentProtocol: Protocol;
  onChangeProtocol: (protocol: Protocol) => void;
  togglePlaybook?: () => void;
  isPlaybookOpen?: boolean;
};

export const Header = ({
  protocols,
  currentProtocol,
  onChangeProtocol,
  togglePlaybook,
  isPlaybookOpen,
}: HeaderProps) => {
  const handleProtocolChange = (protocol: Protocol) => {
    if (currentProtocol.url === protocol.url || currentProtocol.localUrl === protocol.localUrl) return;
    onChangeProtocol(protocol);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-background/30 backdrop-blur-2xl sticky top-0 z-50 border-b border-border">
      <DropdownMenu>
        <DropdownMenuTrigger
          data-test={DataTests.protocol_dropdown_trigger}
          className="flex items-center text-xl gap-8 px-3 py-2"
        >
          <div className="flex items-center gap-1 leading-7 font-medium">
            {currentProtocol.icon && currentProtocol.icon} {currentProtocol.shortName || currentProtocol.name}
            <span className="text-xl text-muted-foreground">Minitel</span>
          </div>
          <ChevronsUpDownIcon className="w-4 h-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="flex flex-col gap-2 w-60 max-h-96 overflow-y-auto">
          {protocols.map((protocol) => (
            <DropdownMenuItem
              className="p-2 text-sm justify-between"
              key={protocol.name}
              onClick={() => handleProtocolChange(protocol)}
            >
              <div className="flex items-center gap-1">
                {protocol.icon && protocol.icon} {protocol.name}
              </div>
              {currentProtocol.name === protocol.name ? (
                <CheckIcon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ExternalLinkIcon className="w-4 h-4 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {togglePlaybook && (
        <Toggle variant="outline" aria-label="Toggle decode playbook" onClick={togglePlaybook}>
          {isPlaybookOpen ? 'Close decode playbook' : 'Open decode playbook'}
          <PanelRightIcon />
        </Toggle>
      )}
    </div>
  );
};
