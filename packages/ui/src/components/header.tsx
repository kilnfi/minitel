import { BookMarkedIcon, CheckIcon, ChevronsUpDownIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '#/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '#/ui/dropdown-menu';

export type Protocol = {
  name: string;
  icon?: React.ReactNode;
  url: string;
};

type HeaderProps = {
  protocols: Protocol[];
  currentProtocol?: Protocol;
  onProtocolChange?: (protocol: Protocol) => void;
  togglePlayground?: () => void;
};

export const Header = ({ protocols, currentProtocol, onProtocolChange, togglePlayground }: HeaderProps) => {
  const handleProtocolChange = (protocol: Protocol) => {
    if (onProtocolChange) {
      onProtocolChange(protocol);
    } else {
      window.location.href = protocol.url;
    }
  };

  return (
    <div className="flex items-center justify-between px-3 py-5 bg-background sticky top-0 z-50 border-b border-border">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-xl gap-8 px-3 py-2">
          <div className="flex items-center gap-1 leading-7">
            {currentProtocol?.icon && currentProtocol.icon} {currentProtocol?.name}
            <span className="text-xl font-medium text-muted-foreground">Minitel</span>
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
              {currentProtocol?.name === protocol.name ? (
                <CheckIcon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ExternalLinkIcon className="w-4 h-4 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" onClick={togglePlayground}>
        Open decode playbook <BookMarkedIcon />
      </Button>
    </div>
  );
};
