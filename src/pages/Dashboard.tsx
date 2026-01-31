import { Mail, Send, Clock, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Emails Received",
    value: 247,
    subtitle: "Last 7 days",
    icon: Mail,
    trend: { value: 12, isPositive: true },
    variant: "primary" as const,
  },
  {
    title: "Auto-Replied",
    value: 183,
    subtitle: "74% of total",
    icon: Send,
    trend: { value: 8, isPositive: true },
    variant: "success" as const,
  },
  {
    title: "In Review Queue",
    value: 12,
    subtitle: "Needs your attention",
    icon: Clock,
    variant: "warning" as const,
  },
  {
    title: "Time Saved",
    value: "14.2 hrs",
    subtitle: "This week",
    icon: Zap,
    trend: { value: 23, isPositive: true },
    variant: "default" as const,
  },
];

const recentActivity = [
  {
    from: "john@company.com",
    subject: "Question about pricing plans",
    action: "replied" as const,
    time: "2 min ago",
    confidence: 94,
  },
  {
    from: "newsletter@techweekly.com",
    subject: "This Week in Tech - Issue #234",
    action: "ignored" as const,
    time: "15 min ago",
  },
  {
    from: "sarah@startup.io",
    subject: "Partnership opportunity discussion",
    action: "queued" as const,
    time: "32 min ago",
    confidence: 42,
  },
  {
    from: "support@vendor.com",
    subject: "Your invoice is ready",
    action: "forwarded" as const,
    time: "1 hr ago",
  },
  {
    from: "mike@clientco.com",
    subject: "Meeting reschedule request",
    action: "replied" as const,
    time: "2 hrs ago",
    confidence: 88,
  },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor your AI email agent's performance and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-card-foreground">
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((email, index) => (
                <ActivityItem key={index} email={email} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          {/* Queue Alert */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="rounded-full bg-amber-100 p-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-amber-900">
                  12 emails need review
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  The AI wasn't confident about these emails.
                </p>
                <Link to="/queue">
                  <Button size="sm" className="mt-3" variant="outline">
                    Review Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Auto-reply rate</span>
                  <span className="font-medium text-card-foreground">74%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full w-[74%] rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. confidence</span>
                  <span className="font-medium text-card-foreground">87%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full w-[87%] rounded-full bg-green-500" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">KB coverage</span>
                  <span className="font-medium text-card-foreground">62%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full w-[62%] rounded-full bg-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
