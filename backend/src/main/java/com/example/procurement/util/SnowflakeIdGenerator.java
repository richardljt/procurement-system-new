package com.example.procurement.util;

public class SnowflakeIdGenerator {

    private final long datacenterId;
    private final long machineId;
    private final long epoch = 1609459200000L; // Jan 1 2021

    private final long datacenterIdBits = 5L;
    private final long machineIdBits = 5L;
    private final long maxDatacenterId = -1L ^ (-1L << datacenterIdBits);
    private final long maxMachineId = -1L ^ (-1L << machineIdBits);
    private final long sequenceBits = 12L;

    private final long machineIdShift = sequenceBits;
    private final long datacenterIdShift = sequenceBits + machineIdBits;
    private final long timestampLeftShift = sequenceBits + machineIdBits + datacenterIdBits;
    private final long sequenceMask = -1L ^ (-1L << sequenceBits);

    private long sequence = 0L;
    private long lastTimestamp = -1L;

    public SnowflakeIdGenerator(long datacenterId, long machineId) {
        if (datacenterId > maxDatacenterId || datacenterId < 0) {
            throw new IllegalArgumentException(String.format("Datacenter ID can't be greater than %d or less than 0", maxDatacenterId));
        }
        if (machineId > maxMachineId || machineId < 0) {
            throw new IllegalArgumentException(String.format("Machine ID can't be greater than %d or less than 0", maxMachineId));
        }
        this.datacenterId = datacenterId;
        this.machineId = machineId;
    }

    public synchronized long nextId() {
        long timestamp = timeGen();

        if (timestamp < lastTimestamp) {
            throw new RuntimeException(String.format("Clock moved backwards.  Refusing to generate id for %d milliseconds", lastTimestamp - timestamp));
        }

        if (lastTimestamp == timestamp) {
            sequence = (sequence + 1) & sequenceMask;
            if (sequence == 0) {
                timestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }

        lastTimestamp = timestamp;

        return ((timestamp - epoch) << timestampLeftShift) |
                (datacenterId << datacenterIdShift) |
                (machineId << machineIdShift) |
                sequence;
    }

    private long tilNextMillis(long lastTimestamp) {
        long timestamp = timeGen();
        while (timestamp <= lastTimestamp) {
            timestamp = timeGen();
        }
        return timestamp;
    }

    private long timeGen() {
        return System.currentTimeMillis();
    }
}
