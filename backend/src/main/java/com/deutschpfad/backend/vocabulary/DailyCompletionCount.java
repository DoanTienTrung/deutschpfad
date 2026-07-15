package com.deutschpfad.backend.vocabulary;

import java.time.LocalDate;

public interface DailyCompletionCount {
    LocalDate getDay();
    long getCount();
}
