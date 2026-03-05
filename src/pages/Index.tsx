import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { NextCourses } from "@/components/dashboard/NextCourses";
import { EventsSection } from "@/components/dashboard/EventsSection";
import { WelcomePanel } from "@/components/dashboard/WelcomePanel";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-0 animate-fade-in h-full">
        {/* Left column - Next courses */}
        <div className="md:col-span-3 h-full">
          <NextCourses />
        </div>

        {/* Middle column - Events */}
        <div className="md:col-span-5 ml-2">
          <EventsSection />
        </div>

        {/* Right column - Welcome panel */}
        <div className="md:col-span-4">
          {showWelcome && (
            <WelcomePanel onClose={() => setShowWelcome(false)} />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
