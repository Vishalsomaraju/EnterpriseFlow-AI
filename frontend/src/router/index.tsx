import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Landing } from '../pages/Landing';
import { Demo } from '../pages/Demo';
import { Dashboard } from '../pages/Dashboard';
import { WorkflowsPage } from '../pages/Workflows';
import { WorkflowGraphPage } from '../pages/WorkflowGraph';
import { ImpactAnalysisPage } from '../pages/ImpactAnalysis';
import { BobBuildLayout } from '../pages/build/BobBuildLayout';
import { BobBuildOverview } from '../pages/build/BobBuildOverview';
import { BobPlan } from '../pages/build/BobPlan';
import { BobChanges } from '../pages/build/BobChanges';
import { ChangeReviewPage } from '../pages/ChangeReview';
import { TestsPage } from '../pages/Tests';
import { DocumentationPage } from '../pages/Documentation';
import { BlueprintPage } from '../pages/Blueprint';
import { CreateWorkflowPage } from '../pages/CreateWorkflow';
import { WorkflowAnalysisPage } from '../pages/WorkflowAnalysis';
import { WorkflowExecutionPage } from '../pages/WorkflowExecution';
import { AuditTrailPage } from '../pages/AuditTrail';
import { ActivityPage } from '../pages/Activity';
import { ProfilePage } from '../pages/Profile';
import { SettingsPage } from '../pages/Settings';
import { HelpPage } from '../pages/Help';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/demo',
    element: <Demo />,
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      {
        path: '',
        element: <Navigate to="/app/dashboard" replace />,
      },
      { 
        path: 'dashboard', 
        element: <Dashboard />,
      },
      {
        path: 'workflows',
        element: <WorkflowsPage />,
      },
      // Stubs for next steps
      { path: 'workflows/new', element: <CreateWorkflowPage /> },
      { path: 'workflows/:id/analysis', element: <WorkflowAnalysisPage /> },
      { path: 'workflows/:id/graph', element: <WorkflowGraphPage /> },
      { path: 'workflows/:id/impact', element: <ImpactAnalysisPage /> },
      { path: 'workflows/:id/blueprint', element: <BlueprintPage /> },
      { 
        path: 'workflows/:id/build', 
        element: <BobBuildLayout />,
        children: [
          { path: '', element: <BobBuildOverview /> },
          { path: 'plan', element: <BobPlan /> },
          { path: 'changes', element: <BobChanges /> }
        ]
      },
      { path: 'workflows/:id/tests', element: <TestsPage /> },
      { path: 'workflows/:id/docs', element: <DocumentationPage /> },
      { path: 'workflows/:id/review', element: <ChangeReviewPage /> },
      { path: 'workflows/:id/execution', element: <WorkflowExecutionPage /> },
      { path: 'workflows/:id/audit', element: <AuditTrailPage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'help', element: <HelpPage /> },
    ],
  },
]);
