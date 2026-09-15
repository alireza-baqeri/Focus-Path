import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export default async function GoalProgressCards({ userId }: { userId: string }) {
  const goals = await prisma.goal.findMany({
    where: { userId, isActive: true },
    take: 3,
  });

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-800 h-full">
      <CardHeader>
        <CardTitle className="text-lg">Active Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal: any) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{goal.title}</span>
                <span className="text-gray-500">In Progress</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 italic">No active goals found. Set up your goals to see progress here.</div>
        )}
      </CardContent>
    </Card>
  );
}
