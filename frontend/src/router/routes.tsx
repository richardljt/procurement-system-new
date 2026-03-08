import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../features/auth/components/LoginPage';
import RequireAuth from '../components/layout/RequireAuth';
import ProcurementList from '../features/procurement/components/ProcurementList';

const CreateProcurement = lazy(() => import('../features/procurement/components/CreateProcurement'));
const ProcurementDetail = lazy(() => import('../features/procurement/components/ProcurementDetail'));
const ProcurementApproval = lazy(() => import('../features/procurement/components/ProcurementApproval'));
const ProcurementProcess = lazy(() => import('../features/procurement/components/ProcurementProcess'));
const RequirementReviewMeetingList = lazy(() => import('../features/meeting/components/RequirementReviewMeetingList'));
const CreateRequirementReviewMeeting = lazy(() => import('../features/meeting/components/CreateRequirementReviewMeeting'));
const RequirementReviewMeetingDetail = lazy(() => import('../features/meeting/components/RequirementReviewMeetingDetail'));
const BidEvaluationList = lazy(() => import('../features/meeting/components/BidEvaluationList'));
const EvaluationMeetingRunning = lazy(() => import('../features/bid/components/EvaluationMeetingRunning'));
const BidManagementList = lazy(() => import('../features/bid/components/BidManagementList'));
const CreateBid = lazy(() => import('../features/bid/components/CreateBid'));
const BidMonitoringPage = lazy(() => import('../features/bid/components/BidMonitoring'));
const ExpertList = lazy(() => import('../features/expert/components/ExpertList'));
const MyTasks = lazy(() => import('../features/tasks/components/MyTasks'));
const MeetingDashboard = lazy(() => import('../features/meeting/components/MeetingDashboard'));
const MeetingReadOnly = lazy(() => import('../features/meeting/components/MeetingReadOnly'));
const MyMeetings = lazy(() => import('../features/meeting/components/MyMeetings'));
const AdmissionApplication = lazy(() => import('../features/supplier/components/AdmissionApplication'));
const SupplierApplyForm = lazy(() => import('../features/supplier/components/SupplierApplyForm'));
const AdmissionReview = lazy(() => import('../features/supplier/components/AdmissionReview'));
const SupplierMyTasks = lazy(() => import('../features/supplier/components/SupplierMyTasks'));
const AnnualInspection = lazy(() => import('../features/supplier/components/AnnualInspection'));
const Evaluation = lazy(() => import('../features/supplier/components/Evaluation'));
const SupplierQuery = lazy(() => import('../features/supplier/components/SupplierQuery'));
const ContractArchivingList = lazy(() => import('../features/contract/components/ContractArchivingList'));

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <ProcurementList /> },
      { path: 'procurement/list', element: <ProcurementList /> },
      { path: 'tasks', element: <MyTasks /> },
      { path: 'my-meetings', element: <MyMeetings /> },
      { path: 'create', element: <CreateProcurement /> },
      { path: 'detail/:id', element: <ProcurementDetail /> },
      { path: 'procurement/process/:id', element: <ProcurementProcess /> },
      { path: 'approval/:id', element: <ProcurementApproval /> },
      { path: 'meeting/requirement-review', element: <RequirementReviewMeetingList /> },
      { path: 'meeting/requirement-review/create', element: <CreateRequirementReviewMeeting /> },
      { path: 'meeting/requirement-review/detail/:id', element: <RequirementReviewMeetingDetail /> },
      { path: 'meeting/bid-evaluation', element: <BidEvaluationList /> },
      { path: 'meeting/evaluation-running/:code', element: <EvaluationMeetingRunning /> },
      { path: 'meeting/review/:id', element: <MeetingDashboard /> },
      { path: 'meeting/review-readonly/:id', element: <MeetingReadOnly /> },
      { path: 'bid/list', element: <BidManagementList /> },
      { path: 'bid/create', element: <CreateBid /> },
      { path: 'bid/edit/:id', element: <CreateBid /> },
      { path: 'bid/monitor/:id', element: <BidMonitoringPage /> },
      { path: 'expert/list', element: <ExpertList /> },
      { path: 'contract/archive', element: <ContractArchivingList /> },
      { path: 'supplier/admission/apply', element: <AdmissionApplication /> },
      { path: 'supplier/admission/create', element: <SupplierApplyForm /> },
      { path: 'supplier/admission/edit/:id', element: <SupplierApplyForm /> },
      { path: 'supplier/admission/detail/:id', element: <SupplierApplyForm /> },
      { path: 'supplier/admission/review', element: <AdmissionReview /> },
      { path: 'supplier/tasks', element: <SupplierMyTasks /> },
      { path: 'supplier/daily/query', element: <SupplierQuery /> },
      { path: 'supplier/daily/inspection', element: <AnnualInspection /> },
      { path: 'supplier/daily/evaluation', element: <Evaluation /> },
    ],
  },
];