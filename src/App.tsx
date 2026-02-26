import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProcurementList from './features/procurement/components/ProcurementList';
import LoginPage from './features/auth/components/LoginPage';
import RequireAuth from './components/layout/RequireAuth';

const CreateProcurement = lazy(() => import('./features/procurement/components/CreateProcurement'));
const ProcurementDetail = lazy(() => import('./features/procurement/components/ProcurementDetail'));
const ProcurementApproval = lazy(() => import('./features/procurement/components/ProcurementApproval'));
const ProcurementProcess = lazy(() => import('./features/procurement/components/ProcurementProcess'));
const RequirementReviewMeetingList = lazy(() => import('./features/meeting/components/RequirementReviewMeetingList'));
const CreateRequirementReviewMeeting = lazy(() => import('./features/meeting/components/CreateRequirementReviewMeeting'));
const RequirementReviewMeetingDetail = lazy(() => import('./features/meeting/components/RequirementReviewMeetingDetail'));
const BidEvaluationList = lazy(() => import('./features/meeting/components/BidEvaluationList'));
const EvaluationMeetingRunning = lazy(() => import('./features/bid/components/EvaluationMeetingRunning'));
const BidManagementList = lazy(() => import('./features/bid/components/BidManagementList'));
const CreateBid = lazy(() => import('./features/bid/components/CreateBid'));
const BidMonitoringPage = lazy(() => import('./features/bid/components/BidMonitoring'));
const ExpertList = lazy(() => import('./features/expert/components/ExpertList'));
const MyTasks = lazy(() => import('./features/tasks/components/MyTasks'));
const MeetingDashboard = lazy(() => import('./features/meeting/components/MeetingDashboard'));
const MeetingReadOnly = lazy(() => import('./features/meeting/components/MeetingReadOnly'));
const MyMeetings = lazy(() => import('./features/meeting/components/MyMeetings'));
const AdmissionApplication = lazy(() => import('./features/supplier/components/AdmissionApplication'));
const SupplierApplyForm = lazy(() => import('./features/supplier/components/SupplierApplyForm'));
const AdmissionReview = lazy(() => import('./features/supplier/components/AdmissionReview'));
const SupplierMyTasks = lazy(() => import('./features/supplier/components/SupplierMyTasks'));
const AnnualInspection = lazy(() => import('./features/supplier/components/AnnualInspection'));
const Evaluation = lazy(() => import('./features/supplier/components/Evaluation'));
const SupplierQuery = lazy(() => import('./features/supplier/components/SupplierQuery'));
const ContractArchivingList = lazy(() => import('./features/contract/components/ContractArchivingList'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<ProcurementList />} />
            <Route path="procurement/list" element={<ProcurementList />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="my-meetings" element={<MyMeetings />} />
            <Route path="create" element={<CreateProcurement />} />
            <Route path="detail/:id" element={<ProcurementDetail />} />
            <Route path="procurement/process/:id" element={<ProcurementProcess />} />
            <Route path="approval/:id" element={<ProcurementApproval />} />
            <Route path="meeting/requirement-review" element={<RequirementReviewMeetingList />} />
            <Route path="meeting/requirement-review/create" element={<CreateRequirementReviewMeeting />} />
            <Route path="meeting/requirement-review/detail/:id" element={<RequirementReviewMeetingDetail />} />
            <Route path="meeting/bid-evaluation" element={<BidEvaluationList />} />
            <Route path="meeting/evaluation-running/:code" element={<EvaluationMeetingRunning />} />
            <Route path="meeting/review/:id" element={<MeetingDashboard />} />
            <Route path="meeting/review-readonly/:id" element={<MeetingReadOnly />} />
            <Route path="bid/list" element={<BidManagementList />} />
            <Route path="bid/create" element={<CreateBid />} />
            <Route path="bid/edit/:id" element={<CreateBid />} />
            <Route path="bid/monitor/:id" element={<BidMonitoringPage />} />
            <Route path="expert/list" element={<ExpertList />} />
            
            {/* Contract Management Routes */}
            <Route path="contract/archive" element={<ContractArchivingList />} />
            
            {/* Supplier Management Routes */}
            <Route path="supplier/admission/apply" element={<AdmissionApplication />} />
            <Route path="supplier/admission/create" element={<SupplierApplyForm />} />
            <Route path="supplier/admission/edit/:id" element={<SupplierApplyForm />} />
            <Route path="supplier/admission/detail/:id" element={<SupplierApplyForm />} />
            <Route path="supplier/admission/review" element={<AdmissionReview />} />
            <Route path="supplier/tasks" element={<SupplierMyTasks />} />
            <Route path="supplier/daily/query" element={<SupplierQuery />} />
            <Route path="supplier/daily/inspection" element={<AnnualInspection />} />
            <Route path="supplier/daily/evaluation" element={<Evaluation />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
