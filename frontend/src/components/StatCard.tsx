import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  colorClass?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, colorClass = "text-primary" }: StatCardProps) => {
  return (
    <Card className="shadow-elevated hover:shadow-glow transition-all duration-300 gradient-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && <p className="text-xs text-secondary font-medium">{trend}</p>}
          </div>
          <div className={cn("p-3 rounded-lg bg-muted/50", colorClass)}>
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
