import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getAuthSetupIssue,
  getAuthSetupUserMessage,
  getLoginLockoutState,
  registerFailedLoginAttempt,
} from '@/lib/authSecurity';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  BarChart3,
  Users,
  Sparkles,
} from 'lucide-react';
import logo from '@/assets/logo.png';

const highlights = [
  { icon: Users, text: 'Search and filter talent by skills, seniority, and experience' },
  { icon: BarChart3, text: 'Workforce analytics and competency insights' },
  { icon: Sparkles, text: 'AI-assisted resourcing assistant' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const clearError = () => setLoginError(null);

  const authSetupIssue = useMemo(() => getAuthSetupIssue(), []);
  const authConfigMessage =
    authSetupIssue !== 'ok' ? getAuthSetupUserMessage(import.meta.env.DEV) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    if (authSetupIssue !== 'ok') {
      setLoginError(getAuthSetupUserMessage(import.meta.env.DEV));
      setIsLoading(false);
      return;
    }

    const lockout = getLoginLockoutState();
    if (lockout.locked && lockout.retryAfterMs != null) {
      const mins = Math.max(1, Math.ceil(lockout.retryAfterMs / 60_000));
      setLoginError(
        `Too many sign-in attempts. Please try again in about ${mins} minute${mins === 1 ? '' : 's'}.`,
      );
      setIsLoading(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    const success = login(username.trim(), password);

    if (success) {
      toast({
        title: 'Signed in',
        description: 'Welcome to Resourcing Hub.',
      });
      navigate('/');
    } else {
      registerFailedLoginAttempt();
      setPassword('');
      const after = getLoginLockoutState();
      if (after.locked && after.retryAfterMs != null) {
        const mins = Math.max(1, Math.ceil(after.retryAfterMs / 60_000));
        setLoginError(
          `Too many sign-in attempts. Please try again in about ${mins} minute${mins === 1 ? '' : 's'}.`,
        );
        toast({
          title: 'Account temporarily locked',
          description: `Try again in about ${mins} minute${mins === 1 ? '' : 's'}.`,
          variant: 'destructive',
        });
      } else {
        setLoginError('The username or password you entered is incorrect. Please try again.');
        toast({
          title: 'Sign-in failed',
          description: 'Check your credentials and try again.',
          variant: 'destructive',
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Brand panel — enterprise split layout */}
      <aside
        className={cn(
          'relative flex flex-col justify-between px-8 py-10 lg:py-14 lg:px-12 lg:w-[46%] xl:w-[42%]',
          'bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground',
          'border-b lg:border-b-0 lg:border-r border-primary/20',
        )}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-90"
        />
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground shadow-sm ring-1 ring-primary-foreground/30">
              <img src={logo} alt="" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/80">
                Internal
              </p>
              <h1 className="text-xl font-semibold tracking-tight">Resourcing Hub</h1>
            </div>
          </div>
          <div className="space-y-3 max-w-md">
            <p className="text-lg font-medium leading-snug text-primary-foreground/95">
              One place to find the right people for every engagement.
            </p>
            <p className="text-sm leading-relaxed text-primary-foreground/75">
              Access your organisation&apos;s talent directory, filters, and analytics with a secure
              sign-in.
            </p>
          </div>
          <ul className="space-y-4 pt-2">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-sm text-primary-foreground/85">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 ring-1 ring-primary-foreground/15">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="leading-relaxed pt-1">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 mt-12 text-xs text-primary-foreground/60">
          Authorised use only. Activity may be monitored in line with company policy.
        </p>
      </aside>

      {/* Sign-in form */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-1 lg:hidden text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <img src={logo} alt="" className="h-8 w-8 object-contain" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">Resourcing Hub</p>
          </div>

          <Card className="border-border/80 shadow-lg shadow-black/5 dark:shadow-black/20">
            <CardHeader className="space-y-1 pb-4 hidden lg:block">
              <CardTitle className="text-2xl font-semibold tracking-tight">Sign in</CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to continue to the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 lg:pt-2">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {authConfigMessage && (
                  <Alert
                    variant={import.meta.env.DEV ? 'default' : 'destructive'}
                    className={
                      import.meta.env.DEV
                        ? 'border-amber-500/40 bg-amber-500/10 py-3 text-amber-950 dark:text-amber-100'
                        : 'py-3'
                    }
                  >
                    <AlertDescription className="text-sm">{authConfigMessage}</AlertDescription>
                  </Alert>
                )}
                {loginError && (
                  <Alert id="login-error" variant="destructive" className="py-3">
                    <AlertDescription className="text-sm">{loginError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      inputMode="text"
                      spellCheck={false}
                      placeholder="e.g. resourcing"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        clearError();
                      }}
                      className={cn(
                        'h-11 pl-9',
                        loginError && 'border-destructive/60 focus-visible:ring-destructive/30',
                      )}
                      required
                      aria-invalid={!!loginError}
                      aria-describedby={loginError ? 'login-error' : undefined}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError();
                      }}
                      className={cn(
                        'h-11 pl-9 pr-11',
                        loginError && 'border-destructive/60 focus-visible:ring-destructive/30',
                      )}
                      required
                      aria-invalid={!!loginError}
                      aria-describedby={loginError ? 'login-error' : undefined}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Signing in…
                    </>
                  ) : (
                    'Sign in to Resourcing Hub'
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
                Having trouble signing in?{' '}
                <span className="text-foreground/80">Contact your IT or resourcing administrator.</span>
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" aria-hidden />
            <span>Session secured for internal use</span>
          </div>
        </div>
      </main>
    </div>
  );
}
