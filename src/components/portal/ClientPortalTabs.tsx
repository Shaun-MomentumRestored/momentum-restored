"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WeeklyTasks from "./WeeklyTasks";
import ResultsWins from "./ResultsWins";
import Goal12Month from "./Goal12Month";
import MonthlyGoals from "./MonthlyGoals";
import MeetingNotes from "./MeetingNotes";
import ExcuseJournal from "./ExcuseJournal";
import RevenueTracker from "./RevenueTracker";
import ExecutionContract from "./ExecutionContract";

export default function ClientPortalTabs({
  slug,
  clientName,
}: {
  slug: string;
  clientName: string;
}) {
  return (
    <Tabs defaultValue="tasks" className="w-full">
      <div className="overflow-x-auto pb-1">
        <TabsList className="flex w-max gap-0.5 min-w-full sm:min-w-0">
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">Tasks</TabsTrigger>
          <TabsTrigger value="wins" className="text-xs sm:text-sm">Wins</TabsTrigger>
          <TabsTrigger value="goal" className="text-xs sm:text-sm">12M Goal</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs sm:text-sm">Monthly</TabsTrigger>
          <TabsTrigger value="meetings" className="text-xs sm:text-sm">Sessions</TabsTrigger>
          <TabsTrigger value="journal" className="text-xs sm:text-sm">Journal</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs sm:text-sm">Revenue</TabsTrigger>
          <TabsTrigger value="contract" className="text-xs sm:text-sm">Contract</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="tasks">
        <WeeklyTasks slug={slug} />
      </TabsContent>
      <TabsContent value="wins">
        <ResultsWins slug={slug} />
      </TabsContent>
      <TabsContent value="goal">
        <Goal12Month slug={slug} />
      </TabsContent>
      <TabsContent value="monthly">
        <MonthlyGoals slug={slug} />
      </TabsContent>
      <TabsContent value="meetings">
        <MeetingNotes slug={slug} />
      </TabsContent>
      <TabsContent value="journal">
        <ExcuseJournal slug={slug} />
      </TabsContent>
      <TabsContent value="revenue">
        <RevenueTracker slug={slug} />
      </TabsContent>
      <TabsContent value="contract">
        <ExecutionContract slug={slug} />
      </TabsContent>
    </Tabs>
  );
}
