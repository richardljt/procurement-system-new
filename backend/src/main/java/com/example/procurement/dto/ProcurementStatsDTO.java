package com.example.procurement.dto;

public class ProcurementStatsDTO {
    private long total;
    private long approving;
    private long approved;
    private long rejected;

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getApproving() {
        return approving;
    }

    public void setApproving(long approving) {
        this.approving = approving;
    }

    public long getApproved() {
        return approved;
    }

    public void setApproved(long approved) {
        this.approved = approved;
    }

    public long getRejected() {
        return rejected;
    }

    public void setRejected(long rejected) {
        this.rejected = rejected;
    }
}
