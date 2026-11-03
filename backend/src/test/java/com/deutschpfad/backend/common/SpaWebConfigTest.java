package com.deutschpfad.backend.common;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SpaWebConfigTest {

    @Test
    void trangCuaReactRouter_traIndexHtml() {
        assertThat(SpaWebConfig.isAppRoute("")).isTrue();
        assertThat(SpaWebConfig.isAppRoute("login")).isTrue();
        assertThat(SpaWebConfig.isAppRoute("app/grammar/praesens")).isTrue();
        assertThat(SpaWebConfig.isAppRoute("oauth2/callback")).isTrue();
        assertThat(SpaWebConfig.isAppRoute("admin/translation")).isTrue();
    }

    @Test
    void apiVaOauthCuaBackend_khongBaoGioTraIndexHtml() {
        assertThat(SpaWebConfig.isAppRoute("api/khong-co")).isFalse();
        assertThat(SpaWebConfig.isAppRoute("api")).isFalse();
        assertThat(SpaWebConfig.isAppRoute("ws/speaking-live")).isFalse();
        assertThat(SpaWebConfig.isAppRoute("oauth2/authorization/google")).isFalse();
        assertThat(SpaWebConfig.isAppRoute("login/oauth2/code/google")).isFalse();
    }

    @Test
    void fileKhongCoThatVaDuongDanBotDo_tra404() {
        assertThat(SpaWebConfig.isAppRoute("wp-login.php")).isFalse();
        assertThat(SpaWebConfig.isAppRoute("assets/index-old.js")).isFalse();
        assertThat(SpaWebConfig.isAppRoute(".env")).isFalse();
        assertThat(SpaWebConfig.isAppRoute(".git/config")).isFalse();
        assertThat(SpaWebConfig.isAppRoute("app/.hidden/x")).isFalse();
        assertThat(SpaWebConfig.isAppRoute("wp-admin")).isFalse();
        assertThat(SpaWebConfig.isAppRoute("phpMyAdmin/index")).isFalse();
        assertThat(SpaWebConfig.isAppRoute("backup")).isFalse();
    }
}
