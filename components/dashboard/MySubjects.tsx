import { BookOpen, Clock, Users, FileText, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { queryFunctions } from "@/lib/api/queries";
import { apiRequest } from "@/lib/queryClient";

export function MySubjects({ user, onPageChange }: { user: any; onPageChange: (page: string) => void }) {
  const subjects = user?.subjects || [];
  const degreeProgram = user?.degreeProgram || "Not Set";

  const { data: subjectStats = {}, isLoading } = useQuery({
    queryKey: ["/api/subjects/stats", subjects],
    queryFn: async () => {
      if (subjects.length === 0) return {};
      const res = await apiRequest("POST", "/api/subjects/stats", { subjects });
      return res.json();
    },
    enabled: subjects.length > 0,
  });

  const getSubjectCode = (subject: string) => {
    const match = subject.match(/^([A-Z]{2,4}\d{3})/);
    return match ? match[1] : subject.substring(0, 6);
  };

  const getSubjectName = (subject: string) => {
    const parts = subject.split(" - ");
    return parts.length > 1 ? parts[1] : subject;
  };

  const getSubjectColor = (code: string) => {
    // Deterministic color based on char code
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500", "bg-teal-500"];
    const index = code.charCodeAt(code.length - 1) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary/40" />
          </div>
        </div>
        <p className="text-muted-foreground animate-pulse">Loading subject statistics...</p>
      </div>
    );
  }

  const totalResources = Object.values(subjectStats).reduce((acc: number, curr: any) => acc + (curr.resources || 0), 0) as number;
  const totalAssignments = Object.values(subjectStats).reduce((acc: number, curr: any) => acc + (curr.solutions || 0), 0) as number;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Subjects</h1>
          <p className="text-muted-foreground mt-2">
            {degreeProgram} • {subjects.length} subjects enrolled
          </p>
        </div>
        <Button variant="outline" onClick={() => onPageChange('manage-subjects-flow')}>
          <BookOpen className="mr-2" size={16} />
          Manage Subjects
        </Button>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Subjects Selected
            </h3>
            <p className="text-muted-foreground mb-4">
              You haven't selected any subjects yet. Complete your profile setup to get started.
            </p>
            <Button onClick={() => onPageChange('manage-subjects-flow')}>Complete Setup</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject: string, index: number) => {
            const code = getSubjectCode(subject);
            const name = getSubjectName(subject);
            // Use real stats or default to 0
            const stats = (subjectStats as any)[subject] || { resources: 0, solutions: 0, discussions: 0 };
            const progress = 0; // Placeholder until we have progress tracking
            const color = getSubjectColor(code);

            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <Badge variant="secondary">{code}</Badge>
                  </div>
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription>Progress: {progress}%</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progress} className="h-2" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{stats.solutions} Assignments</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{stats.resources} Resources</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{stats.discussions} Discussions</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>0 Badges</span>
                    </div>
                  </div>

                  <Button size="default" variant="outline" className="flex-1 py-5" onClick={() => onPageChange('resources')}>
                    View Resources
                  </Button>
                  <Button size="default" className="flex-1 py-5" onClick={() => onPageChange('discussions')}>
                    Join Discussion
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Total Subjects</p>
                  <p className="text-lg font-semibold">{subjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Active Assignments</p>
                  <p className="text-lg font-semibold">{totalAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Total Resources</p>
                  <p className="text-lg font-semibold">{totalResources}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                  <p className="text-lg font-semibold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}