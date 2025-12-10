import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { searchResources, Resource } from '@/services/resourceApi';
import { useProperties } from '@/hooks/useProperties';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileMenu } from '@/components/ProfileMenu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, Award, Briefcase, TrendingUp, Building2, 
  ArrowLeft, Layers, Target, CheckCircle2, Loader2
} from 'lucide-react';
import logo from '@/assets/logo.png';

interface SkillAnalysis {
  name: string;
  total: number;
  senior: number;
  mid: number;
  junior: number;
  category: string;
}

interface CategoryAnalysis {
  name: string;
  count: number;
  percentage: number;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
  'hsl(var(--chart-9))',
  'hsl(var(--chart-10))',
];

const Analytics = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const { properties } = useProperties(isTestMode);

  useEffect(() => {
    const fetchAllResources = async () => {
      setIsLoading(true);
      try {
        const response = await searchResources(
          {
            employmentTypes: [],
            seniorities: [],
            roleTitles: [],
            skills: [],
            industries: [],
            certificates: [],
            verticals: [],
          },
          '',
          isTestMode
        );
        if (response.success) {
          setResources(response.results);
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllResources();
  }, [isTestMode]);

  // Skill analysis
  const skillAnalysis = useMemo(() => {
    const skillMap = new Map<string, SkillAnalysis>();

    resources.forEach(resource => {
      const processSkills = (skills: string[], level: 'senior' | 'mid' | 'junior') => {
        skills.forEach(skill => {
          const parts = skill.split(' - ');
          const category = parts.length > 1 ? parts[0] : 'General';
          const skillName = parts.length > 1 ? parts[1] : skill;

          if (!skillMap.has(skill)) {
            skillMap.set(skill, {
              name: skillName,
              total: 0,
              senior: 0,
              mid: 0,
              junior: 0,
              category,
            });
          }
          const entry = skillMap.get(skill)!;
          entry.total++;
          entry[level]++;
        });
      };

      if (resource.skills) {
        processSkills(resource.skills.senior || [], 'senior');
        processSkills(resource.skills.mid || [], 'mid');
        processSkills(resource.skills.junior || [], 'junior');
      }
    });

    return Array.from(skillMap.values()).sort((a, b) => b.total - a.total);
  }, [resources]);

  // Certificate analysis
  const certificateAnalysis = useMemo((): CategoryAnalysis[] => {
    const certMap = new Map<string, number>();
    resources.forEach(resource => {
      (resource.certificates || []).forEach(cert => {
        certMap.set(cert, (certMap.get(cert) || 0) + 1);
      });
    });
    return Array.from(certMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / resources.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [resources]);

  // Industry analysis
  const industryAnalysis = useMemo((): CategoryAnalysis[] => {
    const indMap = new Map<string, number>();
    resources.forEach(resource => {
      (resource.industries || []).forEach(ind => {
        indMap.set(ind, (indMap.get(ind) || 0) + 1);
      });
    });
    return Array.from(indMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / resources.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [resources]);

  // Employment type breakdown
  const employmentBreakdown = useMemo((): CategoryAnalysis[] => {
    const typeMap = new Map<string, number>();
    resources.forEach(resource => {
      const type = resource.employment_type || 'Unknown';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    return Array.from(typeMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / resources.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [resources]);

  // Seniority breakdown
  const seniorityBreakdown = useMemo((): CategoryAnalysis[] => {
    const senMap = new Map<string, number>();
    resources.forEach(resource => {
      const level = resource.seniority_level || 'Unknown';
      senMap.set(level, (senMap.get(level) || 0) + 1);
    });
    return Array.from(senMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / resources.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [resources]);

  // Role breakdown
  const roleBreakdown = useMemo((): CategoryAnalysis[] => {
    const roleMap = new Map<string, number>();
    resources.forEach(resource => {
      const role = resource.role_category || 'Unknown';
      roleMap.set(role, (roleMap.get(role) || 0) + 1);
    });
    return Array.from(roleMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / resources.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [resources]);

  // Skill categories summary
  const skillCategories = useMemo(() => {
    const catMap = new Map<string, { total: number; skills: string[] }>();
    skillAnalysis.forEach(skill => {
      if (!catMap.has(skill.category)) {
        catMap.set(skill.category, { total: 0, skills: [] });
      }
      const entry = catMap.get(skill.category)!;
      entry.total += skill.total;
      entry.skills.push(skill.name);
    });
    return Array.from(catMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [skillAnalysis]);

  // Most abundant skills
  const mostAbundantSkills = useMemo(() => 
    skillAnalysis.slice(0, 15), 
    [skillAnalysis]
  );

  // Total unique counts
  const totalCertificates = certificateAnalysis.length;
  const totalIndustries = industryAnalysis.length;
  const totalSkills = skillAnalysis.length;
  const totalResourcesWithCerts = resources.filter(r => (r.certificates?.length || 0) > 0).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Hub</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <img src={logo} alt="Company Logo" className="h-8 w-8 object-contain" />
              <h1 className="text-xl font-bold">Resource Analytics</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ProfileMenu
              isTestMode={isTestMode} 
              onTestModeToggle={setIsTestMode}
            />
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{resources.length}</p>
                  <p className="text-xs text-muted-foreground">Total Resources</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-1/10">
                  <Target className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSkills}</p>
                  <p className="text-xs text-muted-foreground">Unique Skills</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10">
                  <Award className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCertificates}</p>
                  <p className="text-xs text-muted-foreground">Certificate Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-3/10">
                  <Briefcase className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalIndustries}</p>
                  <p className="text-xs text-muted-foreground">Industries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10">
                  <Layers className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{skillCategories.length}</p>
                  <p className="text-xs text-muted-foreground">Skill Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-5/10">
                  <CheckCircle2 className="h-5 w-5 text-chart-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round((totalResourcesWithCerts / resources.length) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Certified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="industries">Industries</TabsTrigger>
            <TabsTrigger value="workforce">Workforce</TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Most Abundant Skills
                </CardTitle>
                <CardDescription>Skills with the highest coverage across the team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mostAbundantSkills} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        className="text-xs"
                        width={100}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                      />
                      <Bar dataKey="senior" stackId="a" fill="hsl(142, 76%, 36%)" name="Senior" />
                      <Bar dataKey="mid" stackId="a" fill="hsl(221, 83%, 53%)" name="Mid" />
                      <Bar dataKey="junior" stackId="a" fill="hsl(262, 83%, 58%)" name="Junior" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Skill Competency Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-chart-4" />
                  Skill Competency Heatmap
                </CardTitle>
                <CardDescription>Distribution of skills across seniority levels - darker colors indicate higher counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
                    <span className="text-muted-foreground">Senior</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/30" />
                    <span className="text-muted-foreground">Mid</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500/30" />
                    <span className="text-muted-foreground">Junior</span>
                  </div>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-1">
                    {/* Header */}
                    <div className="grid grid-cols-[200px_1fr_1fr_1fr] gap-1 pb-2 border-b sticky top-0 bg-card z-10">
                      <div className="text-xs font-semibold text-muted-foreground px-2">Skill</div>
                      <div className="text-xs font-semibold text-center text-green-600 dark:text-green-400">Senior</div>
                      <div className="text-xs font-semibold text-center text-blue-600 dark:text-blue-400">Mid</div>
                      <div className="text-xs font-semibold text-center text-purple-600 dark:text-purple-400">Junior</div>
                    </div>
                    {/* Rows */}
                    {skillAnalysis.slice(0, 30).map((skill, idx) => {
                      const maxCount = Math.max(skill.senior, skill.mid, skill.junior, 1);
                      const getOpacity = (count: number) => Math.max(0.1, count / maxCount);
                      
                      return (
                        <div key={idx} className="grid grid-cols-[200px_1fr_1fr_1fr] gap-1 items-center py-1 hover:bg-muted/50 rounded transition-colors">
                          <div className="text-sm truncate px-2" title={`${skill.category} - ${skill.name}`}>
                            <span className="font-medium">{skill.name}</span>
                            <span className="text-xs text-muted-foreground ml-1">({skill.category})</span>
                          </div>
                          <div 
                            className="h-8 rounded flex items-center justify-center text-xs font-semibold transition-all"
                            style={{ 
                              backgroundColor: `rgba(34, 197, 94, ${getOpacity(skill.senior)})`,
                              color: skill.senior > 0 ? (getOpacity(skill.senior) > 0.5 ? 'white' : 'hsl(142, 76%, 36%)') : 'hsl(var(--muted-foreground))'
                            }}
                          >
                            {skill.senior || '-'}
                          </div>
                          <div 
                            className="h-8 rounded flex items-center justify-center text-xs font-semibold transition-all"
                            style={{ 
                              backgroundColor: `rgba(59, 130, 246, ${getOpacity(skill.mid)})`,
                              color: skill.mid > 0 ? (getOpacity(skill.mid) > 0.5 ? 'white' : 'hsl(221, 83%, 53%)') : 'hsl(var(--muted-foreground))'
                            }}
                          >
                            {skill.mid || '-'}
                          </div>
                          <div 
                            className="h-8 rounded flex items-center justify-center text-xs font-semibold transition-all"
                            style={{ 
                              backgroundColor: `rgba(168, 85, 247, ${getOpacity(skill.junior)})`,
                              color: skill.junior > 0 ? (getOpacity(skill.junior) > 0.5 ? 'white' : 'hsl(262, 83%, 58%)') : 'hsl(var(--muted-foreground))'
                            }}
                          >
                            {skill.junior || '-'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {certificateAnalysis
                .filter(cert => cert.name && cert.name.toLowerCase() !== 'no certificates' && cert.name.trim() !== '')
                .map((cert, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-chart-2/10 shrink-0">
                          <Award className="h-4 w-4 text-chart-2" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate" title={cert.name}>{cert.name}</p>
                          <p className="text-2xl font-bold text-chart-2 mt-1">{cert.count}</p>
                          <p className="text-xs text-muted-foreground">resources</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Industries Tab */}
          <TabsContent value="industries" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Industry Knowledge Distribution
                  </CardTitle>
                  <CardDescription>Resources with experience in each industry</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={industryAnalysis.slice(0, 10)}
                          cx="50%"
                          cy="50%"
                          outerRadius={140}
                          dataKey="count"
                          nameKey="name"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {industryAnalysis.slice(0, 10).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Industries</CardTitle>
                  <CardDescription>Complete industry knowledge breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {industryAnalysis.map((ind, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate max-w-[60%]">{ind.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {ind.count} ({ind.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={ind.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workforce Tab */}
          <TabsContent value="workforce" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Employment Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Employment Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={employmentBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="count"
                          nameKey="name"
                        >
                          {employmentBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {employmentBreakdown.map((type, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>{type.name}</span>
                        <span className="font-medium">{type.count} ({type.percentage.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Seniority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Seniority Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={seniorityBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                  <CardDescription>Resources by role category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roleBreakdown} margin={{ bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="name" 
                          className="text-xs" 
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
