package com.deutschpfad.backend.common;

import java.security.SecureRandom;
import java.util.UUID;

/**
 * RFC 9562 UUID version 7: 48-bit millisecond timestamp in the high bits, so ids sort
 * roughly by creation time (good B-tree locality) while staying globally unique like a
 * random UUID. No external dependency because the layout is a handful of bit operations.
 */
public final class Uuidv7 {

    private static final SecureRandom RANDOM = new SecureRandom();

    private Uuidv7() {
    }

    public static UUID randomUUID() {
        long timestamp = System.currentTimeMillis();
        long randA = RANDOM.nextLong() & 0xFFFL; // 12 random bits
        long randB = RANDOM.nextLong() & 0x3FFFFFFFFFFFFFFFL; // 62 random bits

        long msb = ((timestamp & 0xFFFFFFFFFFFFL) << 16) | 0x7000L | randA;
        long lsb = 0x8000000000000000L | randB; // variant bits '10'

        return new UUID(msb, lsb);
    }
}
