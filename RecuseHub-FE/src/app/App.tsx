/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TopBar } from "../shared/components/TopBar";
import { Sidebar } from "../shared/components/Sidebar";
import { HomePage } from "../features/home/pages/HomePage";
import { AlertCenterPage } from "../features/alerts/pages/AlertCenterPage";
import { RescueTrackPage } from "../features/tracking/pages/RescueTrackPage";
import { CreateRequestPage } from "../features/request/pages/CreateRequestPage";
import { SupportConfirmedPage } from "../features/request/pages/SupportConfirmedPage";
import { View } from "../shared/types";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomePage onViewChange={setCurrentView} />;
      case "alerts":
        return <AlertCenterPage onViewChange={setCurrentView} />;
      case "track":
        return <RescueTrackPage onViewChange={setCurrentView} />;
      case "request":
        return <CreateRequestPage onViewChange={setCurrentView} />;
      case "confirmed":
        return <SupportConfirmedPage onViewChange={setCurrentView} />;
      default:
        return <HomePage onViewChange={setCurrentView} />;
    }
  };

  const showSidebar = currentView !== "request" && currentView !== "confirmed";

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20 selection:text-primary">
      <TopBar currentView={currentView} onViewChange={setCurrentView} />

      <div className="flex pt-20">
        {showSidebar && (
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        )}

        <main
          className={`flex-1 p-8 transition-all duration-300 ${showSidebar ? "md:ml-64" : "ml-0"}`}
        >
          {renderView()}
        </main>
      </div>
    </div>
  );
}
