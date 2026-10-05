package com.deutschpfad.backend.listening;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ListeningChannelRepository extends JpaRepository<ListeningChannel, Long> {
    Optional<ListeningChannel> findByYoutubeChannelId(String youtubeChannelId);

    List<ListeningChannel> findAllByOrderByOrderIndexAscNameAsc();
}
