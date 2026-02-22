import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProcurementList from './pages/ProcurementList';
import LoginPage from './pages/LoginPage';
import RequireAuth from './components/layout/RequireAuth';

const CreateProcurement = lazy(() => import('./pages/CreateProcurement'));
const ProcurementDetail = lazy(() => import('./pages/ProcurementDetail'));
const ProcurementApproval = lazy(() => import('./pages/ProcurementApproval'));
const ProcurementProcess = lazy(() => import('./pages/procurement/ProcurementProcess'));
const RequirementReviewMeetingList = lazy(() => import('./pages/RequirementReviewMeetingList'));
const CreateRequirementReviewMeeting = lazy(() => import('./pages/CreateRequirementReviewMeeting'));
const RequirementReviewMeetingDetail = lazy(() => import('./pages/RequirementReviewMeetingDetail'));
const BidEvaluationList = lazy(() => import('./pages/meeting/BidEvaluationList'));
const EvaluationMeetingRunning = lazy(() => import('./pages/bid/EvaluationMeetingRunning'));
const BidManagementList = lazy(() => import('./pages/bid/BidManagementList'));
const CreateBid = lazy(() => import('./pages/bid/CreateBid'));
const BidMonitoringPage = lazy(() => import('./pages/bid/BidMonitoring'));
const ExpertList = lazy(() => import('./pages/ExpertList'));
const MyTasks = lazy(() => import('./pages/MyTasks'));
const MeetingDashboard = lazy(() => import('./pages/meeting/MeetingDashboard'));
const MeetingReadOnly = lazy(() => import('./pages/meeting/MeetingReadOnly'));
const MyMeetings = lazy(() => import('./pages/MyMeetings'));
const AdmissionApplication = lazy(() => import('./pages/supplier/AdmissionApplication'));
const SupplierApplyForm = lazy(() => import('./pages/supplier/SupplierApplyForm'));
const AdmissionReview = lazy(() => import('./pages/supplier/AdmissionReview'));
const SupplierMyTasks = lazy(() => import('./pages/supplier/SupplierMyTasks'));
const AnnualInspection = lazy(() => import('./pages/supplier/AnnualInspection'));
const Evaluation = lazy(() => import('./pages/supplier/Evaluation'));
const SupplierQuery = lazy(() => import('./pages/supplier/SupplierQuery'));
const ContractArchivingList = lazy(() => import('./pages/contract/ContractArchivingList'));

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
