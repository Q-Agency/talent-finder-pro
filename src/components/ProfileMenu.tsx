import { User, LogOut, Settings, FlaskConical, Rocket, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileMenuProps {
  isTestMode?: boolean;
  onTestModeToggle?: (isTest: boolean) => void;
}

export function ProfileMenu({ 
  isTestMode = false, 
  onTestModeToggle,
}: ProfileMenuProps) {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-popover" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate max-w-[200px]">
              {user?.email ?? 'Signed in'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">Resourcing Hub</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onTestModeToggle && (
          <>
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-2">
                {isTestMode ? (
                  <FlaskConical className="h-4 w-4 text-amber-500" />
                ) : (
                  <Rocket className="h-4 w-4 text-emerald-500" />
                )}
                <span className="text-sm">{isTestMode ? 'Test Mode' : 'Production'}</span>
              </div>
              <Switch
                checked={!isTestMode}
                onCheckedChange={(checked) => onTestModeToggle(!checked)}
              />
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/set-password')}>
          <KeyRound className="mr-2 h-4 w-4" />
          <span>Set password</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
