import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProcurementList from './pages/ProcurementList';
import CreateProcurement from './pages/CreateProcurement';
import ProcurementDetail from './pages/ProcurementDetail';
import ProcurementApproval from './pages/ProcurementApproval';
import ProcurementProcess from './pages/procurement/ProcurementProcess';
import RequirementReviewMeetingList from './pages/RequirementReviewMeetingList';
import CreateRequirementReviewMeeting from './pages/CreateRequirementReviewMeeting';
import RequirementReviewMeetingDetail from './pages/RequirementReviewMeetingDetail';
import BidEvaluationList from './pages/meeting/BidEvaluationList';
import EvaluationMeetingRunning from './pages/bid/EvaluationMeetingRunning';
import BidManagementList from './pages/bid/BidManagementList';
import CreateBid from './pages/bid/CreateBid';
import BidMonitoringPage from './pages/bid/BidMonitoring';
import ExpertList from './pages/ExpertList';
import MyTasks from './pages/MyTasks';
import LoginPage from './pages/LoginPage';
import RequireAuth from './components/layout/RequireAuth';

import MeetingDashboard from './pages/meeting/MeetingDashboard';
import MeetingReadOnly from './pages/meeting/MeetingReadOnly';
import MyMeetings from './pages/MyMeetings';

import AdmissionApplication from './pages/supplier/AdmissionApplication';
import SupplierApplyForm from './pages/supplier/SupplierApplyForm';
import AdmissionReview from './pages/supplier/AdmissionReview';
import SupplierMyTasks from './pages/supplier/SupplierMyTasks';
import AnnualInspection from './pages/supplier/AnnualInspection';
import Evaluation from './pages/supplier/Evaluation';
import SupplierQuery from './pages/supplier/SupplierQuery';
import ContractArchivingList from './pages/contract/ContractArchivingList';

const App: React.FC = () => {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

export default App;
