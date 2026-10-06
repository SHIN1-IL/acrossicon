(() => {
  const TOKEN_KEY = "acrossicon_ops_token";
  const els = {
    token: document.getElementById("token"),
    loginErr: document.getElementById("loginErr"),
    desk: document.getElementById("desk"),
    note: document.getElementById("note"),
    issueMsg: document.getElementById("issueMsg"),
    customerMsg: document.getElementById("customerMsg"),
    rows: document.getElementById("rows"),
  };

  let token = sessionStorage.getItem(TOKEN_KEY) || "";

  function showErr(msg) {
    els.loginErr.hidden = !msg;
    els.loginErr.textContent = msg || "";
  }

  async function admin(path, opts = {}) {
    const res = await fetch(path, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Token": token,
        ...(opts.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const d = data.detail || data.message || `HTTP ${res.status}`;
      throw new Error(typeof d === "string" ? d : JSON.stringify(d));
    }
    return data;
  }

  function startText(lic) {
    if (lic.started_at) return String(lic.started_at).slice(0, 10);
    return "미시작";
  }

  function endText(lic) {
    if (!lic.started_at && lic.duration_days) return `등록 후 ${lic.duration_days}일`;
    return lic.expires_at || "—";
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function customerCopy(lic) {
    const plan = lic.plan || "";
    const isPremium = plan.includes("premium");
    const product = isPremium ? "프리미엄" : "스탠다드";
    const priceHint = isPremium
      ? "유료 월 29,900원 · 하루 20장 · 달 120장"
      : "유료 월 14,900원 · 하루 10장 · 달 60장";
    return [
      "AcrossIcon 키 발급됐습니다.",
      "",
      `키: ${lic.license_key}`,
      `상품: ${product}`,
      `플랜: ${lic.plan_label || lic.plan}`,
      `시작: ${startText(lic) === "미시작" ? "고객이 처음 등록하는 날" : startText(lic)}`,
      `기간: ${endText(lic)}`,
      `한도: 일 ${lic.daily_limit}장 / 달 ${lic.monthly_limit}장`,
      priceHint,
      "",
      "사용 방법:",
      "1) https://acrossicon.onrender.com/app/ 접속",
      "2) 설정 → 라이선스 키 + OpenAI(또는 Google) API 키 저장",
      "3) 로고/상품/홈 이미지 생성",
      "",
      "구독 문의·연장: 카톡/문자 070-8065-1258 · acrosstool@gmail.com",
    ].join("\n");
  }

  async function loadList() {
    const data = await admin("/admin/licenses");
    const list = data.licenses || [];
    els.rows.innerHTML = list
      .map((lic) => {
        const key = lic.license_key;
        return `<tr>
          <td><code>${escapeHtml(key)}</code></td>
          <td>${escapeHtml(lic.plan_label || lic.plan)}</td>
          <td>${escapeHtml(startText(lic))}</td>
          <td>${escapeHtml(endText(lic))}</td>
          <td>${escapeHtml(lic.status)}</td>
          <td>${lic.daily_used ?? 0}/${lic.daily_limit}</td>
          <td>${lic.monthly_used ?? 0}/${lic.monthly_limit}</td>
          <td class="note-cell">
            <input class="note-edit" value="${escapeHtml(lic.note || "")}" />
            <span class="note-state"></span>
          </td>
          <td class="actions">
            <button type="button" data-act="editnote" data-key="${escapeHtml(key)}">수정</button>
            <button type="button" data-act="savenote" data-key="${escapeHtml(key)}">저장</button>
            <button type="button" data-act="copy" data-key="${escapeHtml(key)}">안내</button>
            <button type="button" data-act="extend30" data-key="${escapeHtml(key)}">+30일</button>
            <button type="button" data-act="suspend" data-key="${escapeHtml(key)}">정지</button>
            <button type="button" data-act="activate" data-key="${escapeHtml(key)}">활성</button>
          </td>
        </tr>`;
      })
      .join("");
  }

  const ISSUES = {
    "standard-30": { plan: "standard", days: 30, notePrefix: "스탠다드 14900" },
    "standard-180": { plan: "standard", days: 180, notePrefix: "스탠다드 74500" },
    "standard-365": { plan: "standard", days: 365, notePrefix: "스탠다드 149000" },
    "premium-30": { plan: "premium", days: 30, notePrefix: "프리미엄 29900" },
    "premium-180": { plan: "premium", days: 180, notePrefix: "프리미엄 149500" },
    "premium-365": { plan: "premium", days: 365, notePrefix: "프리미엄 299000" },
    "family-standard": { plan: "family_standard", days: 30, notePrefix: "스탠다드 지인" },
    "family-premium": { plan: "family_premium", days: 30, notePrefix: "프리미엄 지인" },
  };

  async function issue(kind) {
    const spec = ISSUES[kind];
    const extra = els.note.value.trim();
    const note = extra ? `${spec.notePrefix} / ${extra}` : spec.notePrefix;
    const lic = await admin("/admin/licenses", {
      method: "POST",
      body: JSON.stringify({ plan: spec.plan, days: spec.days, note }),
    });
    els.customerMsg.value = customerCopy(lic);
    els.issueMsg.hidden = false;
    els.issueMsg.textContent = `발급됨: ${lic.license_key}`;
    await loadList();
  }

  function cleanToken(raw) {
    return String(raw || "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/^["'\s]+|["'\s]+$/g, "")
      .trim();
  }

  async function enter(ev) {
    if (ev) ev.preventDefault();
    token = cleanToken(els.token.value);
    els.token.value = token;
    if (!token) {
      showErr("토큰을 입력해 주세요.");
      return;
    }
    try {
      await admin("/admin/licenses");
      sessionStorage.setItem(TOKEN_KEY, token);
      showErr("");
      document.getElementById("loginCard").hidden = true;
      els.desk.hidden = false;
      await loadList();
    } catch (e) {
      sessionStorage.removeItem(TOKEN_KEY);
      showErr(e.message || "인증 실패");
    }
  }

  document.getElementById("loginForm").addEventListener("submit", enter);
  document.getElementById("copyMsgBtn").addEventListener("click", async () => {
    const t = els.customerMsg.value;
    if (!t) return;
    await navigator.clipboard.writeText(t);
    els.issueMsg.hidden = false;
    els.issueMsg.textContent = "안내문을 복사했습니다.";
  });
  document.getElementById("refreshBtn").addEventListener("click", () =>
    loadList().catch((e) => alert(e.message)),
  );
  document.querySelectorAll("[data-issue]").forEach((btn) => {
    btn.addEventListener("click", () => issue(btn.dataset.issue).catch((e) => alert(e.message)));
  });

  async function saveNote(key, row) {
    const input = row.querySelector(".note-edit");
    const note = input ? input.value : "";
    const saved = await admin(`/admin/licenses/${encodeURIComponent(key)}/note`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
    if (input) input.value = saved.note ?? note;
    const state = row.querySelector(".note-state");
    if (state) state.textContent = "저장됨";
    els.issueMsg.hidden = false;
    els.issueMsg.textContent = `${key} 메모 저장됨`;
  }

  els.rows.addEventListener("input", (ev) => {
    const input = ev.target.closest(".note-edit");
    if (!input) return;
    const state = input.closest("tr")?.querySelector(".note-state");
    if (state) state.textContent = "";
  });

  els.rows.addEventListener("keydown", async (ev) => {
    if (ev.key !== "Enter") return;
    const input = ev.target.closest(".note-edit");
    if (!input) return;
    ev.preventDefault();
    const row = input.closest("tr");
    const key = row?.querySelector("button[data-act='savenote']")?.dataset.key;
    if (!key || !row) return;
    try {
      await saveNote(key, row);
    } catch (e) {
      alert(e.message);
    }
  });

  els.rows.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button[data-act]");
    if (!btn) return;
    const key = btn.dataset.key;
    const row = btn.closest("tr");
    try {
      if (btn.dataset.act === "editnote") {
        const input = row?.querySelector(".note-edit");
        if (input) {
          input.focus();
          input.select();
        }
        return;
      }
      if (btn.dataset.act === "savenote") {
        await saveNote(key, row);
        return;
      }
      if (btn.dataset.act === "copy") {
        const lic = await admin(`/admin/licenses/${encodeURIComponent(key)}`);
        els.customerMsg.value = customerCopy(lic);
        els.issueMsg.hidden = false;
        els.issueMsg.textContent = `${key} 안내문 작성됨`;
        return;
      }
      if (btn.dataset.act === "extend30") {
        await admin(`/admin/licenses/${encodeURIComponent(key)}/extend`, {
          method: "POST",
          body: JSON.stringify({ days: 30 }),
        });
      }
      if (btn.dataset.act === "suspend") {
        await admin(`/admin/licenses/${encodeURIComponent(key)}/suspend`, { method: "POST" });
      }
      if (btn.dataset.act === "activate") {
        await admin(`/admin/licenses/${encodeURIComponent(key)}/activate`, { method: "POST" });
      }
      await loadList();
    } catch (e) {
      alert(e.message);
    }
  });

  if (token) {
    els.token.value = token;
    enter();
  }
})();
