import { ProcurementRequest } from '../api/procurement';
import { Meeting as RequirementReviewMeeting } from '../api/procurement';
import { BidRecord as Bid } from './bid';
import { Contract } from './contract';

export { Contract }; // Re-export Contract so it can be imported from here

export interface ProcessStatusDTO {
    stage1: StageStatus<ProcurementRequest>;
    stage2: StageStatus<RequirementReviewMeeting>;
    stage3: StageStatus<Bid>;
    stage4: StageStatus<any>; // EvaluationProject
    stage5: StageStatus<Contract>;
}

export interface StageStatus<T> {
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    data?: T;
}
