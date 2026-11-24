/* Чистые функции страницы выбора времени. Проверяются в node (tests/test_webapp.py). */
(function (root) {
  "use strict";
  var M = 60000, D = 86400000;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* Начало текущего рабочего дня (эпоха, мс). dayStartMin — минуты от полуночи по клубу, offMin — пояс клуба. */
  function clubBegin(nowMs, dayStartMin, offMin) {
    var local = nowMs + offMin * M;
    var start = Math.floor(local / D) * D + dayStartMin * M;
    if (local < start) start -= D;
    return start - offMin * M;
  }

  function clubDate(ms, offMin) { return new Date(ms + offMin * M); }

  function hhmm(ms, offMin) {
    var d = clubDate(ms, offMin);
    return pad(d.getUTCHours()) + pad(d.getUTCMinutes());
  }

  function hms(ms, offMin) {
    var d = clubDate(ms, offMin);
    return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds());
  }

  /* Начала часов (эпоха, мс) по клубу от часа начала рабочего дня до текущего часа включительно. */
  function hourSlots(beginMs, nowMs, offMin) {
    var H = 3600000, off = offMin * M, out = [];
    var first = Math.floor((beginMs + off) / H) * H, last = Math.floor((nowMs + off) / H) * H;
    for (var h = first; h <= last; h += H) out.push(h - off);
    return out;
  }

  function clamp(ms, lo, hi) { return Math.min(Math.max(ms, lo), hi); }

  /* base64url(JSON в UTF-8) → объект */
  function decodeCfg(s) {
    var b64 = String(s).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  var api = { clubBegin: clubBegin, hhmm: hhmm, hms: hms, decodeCfg: decodeCfg, hourSlots: hourSlots, clamp: clamp };
  root.Picker = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
