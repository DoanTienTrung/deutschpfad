package com.deutschpfad.backend.vocabulary;

import java.time.LocalDate;

public record HeatmapDayResponse(LocalDate date, long count) {
}
