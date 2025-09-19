import { CheckIcon, ChevronsUpDownIcon, ExternalLinkIcon, PanelRightIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '#/ui/dropdown-menu';
import { Toggle } from '#/ui/toggle';

export type Protocol = {
  name: string;
  icon?: React.ReactNode;
  url: string;
  localUrl?: string;
};

type HeaderProps = {
  protocols: Protocol[];
  currentProtocol: Protocol;
  togglePlayground?: () => void;
  isPlaygroundOpen?: boolean;
};

export const Header = ({ protocols, currentProtocol, togglePlayground, isPlaygroundOpen }: HeaderProps) => {
  const handleProtocolChange = (protocol: Protocol) => {
    if (currentProtocol.url === protocol.url) return;
    window.location.href = protocol.url;
  };

  return (
    <div className="flex items-center justify-between px-3 py-5 bg-background sticky top-0 z-50 border-b border-border">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-xl gap-8 px-3 py-2">
          <div className="flex items-center gap-1 leading-7 font-medium">
            {currentProtocol.icon && currentProtocol.icon} {currentProtocol.name}
            <span className="text-xl text-muted-foreground">Minitel</span>
          </div>
          <ChevronsUpDownIcon className="w-4 h-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="flex flex-col gap-2 w-60">
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
      <Toggle variant="outline" aria-label="Toggle decode playbook" onClick={togglePlayground}>
        {isPlaygroundOpen ? 'Close decode playbook' : 'Open decode playbook'}
        <PanelRightIcon />
      </Toggle>
    </div>
  );
};
