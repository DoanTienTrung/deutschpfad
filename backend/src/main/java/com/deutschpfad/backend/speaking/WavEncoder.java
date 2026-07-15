package com.deutschpfad.backend.speaking;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

/**
 * Wraps raw PCM16 (linear16) audio bytes in a standard 44-byte WAV header so browsers can play
 * them directly via an {@code <audio>} tag without any client-side decoding. Pure logic, no
 * Spring dependency — same pattern as {@code TranscriptParser}/{@code PronunciationScorer}.
 */
public class WavEncoder {

    public static byte[] wrapPcm16(byte[] pcmData, int sampleRate, int channels) {
        int byteRate = sampleRate * channels * 2;
        int blockAlign = channels * 2;
        int dataSize = pcmData.length;

        ByteArrayOutputStream out = new ByteArrayOutputStream(44 + dataSize);
        ByteBuffer header = ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN);

        header.put("RIFF".getBytes());
        header.putInt(36 + dataSize);
        header.put("WAVE".getBytes());

        header.put("fmt ".getBytes());
        header.putInt(16);
        header.putShort((short) 1); // PCM
        header.putShort((short) channels);
        header.putInt(sampleRate);
        header.putInt(byteRate);
        header.putShort((short) blockAlign);
        header.putShort((short) 16); // bits per sample

        header.put("data".getBytes());
        header.putInt(dataSize);

        out.writeBytes(header.array());
        out.writeBytes(pcmData);
        return out.toByteArray();
    }
}
