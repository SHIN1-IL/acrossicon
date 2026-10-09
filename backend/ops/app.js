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
    listTitle: document.getElementById("listTitle"),
    listHint: document.getElementById("listHint"),
    deletedViewBtn: document.getElementById("deletedViewBtn"),
    activeViewBtn: document.getElementById("activeViewBtn"),
  };

  let token = sessionStorage.getItem(TOKEN_KEY) || "";
  /** @type {'active' | 'deleted'} */
  let listView = "active";
  let deletedCount = 0;

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

  function statusLabel(status) {
    if (status === "suspended") return "정지";
    if (status === "deleted") return "삭제됨";
    if (status === "active") return "활성";
    return status || "—";
  }

  function updateListChrome() {
    const deleted = listView === "deleted";
    els.listTitle.textContent = deleted ? "삭제된 라이선스" : "라이선스";
    els.listHint.hidden = !deleted;
    els.deletedViewBtn.hidden = deleted;
    els.activeViewBtn.hidden = !deleted;
    els.deletedViewBtn.textContent =
      deletedCount > 0 ? `삭제 목록 (${deletedCount})` : "삭제 목록";
  }

  function customerCopy(lic) {
    const plan = lic.plan || "";
    const isPremium = plan.includes("premium");
    const product = isPremium ? "프리미엄" : "스탠다드";
    const priceHint = isPremium
      ? "유료 월 29,900원 · 하루 30장 · 달 120장"
      : "유료 월 14,900원 · 하루 20장 · 달 60장";
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
      "2) 설정 → 라이선스 키만 입력 → 저장",
      "3) 로고/상품/홈 이미지 생성 (API 키 등록 불필요)",
      "",
      "구독 문의·연장: 카톡/문자 070-8065-1258 · acrosstool@gmail.com",
    ].join("\n");
  }

  function rowActions(lic) {
    const key = escapeHtml(lic.license_key);
    if (listView === "deleted") {
      return `
            <button type="button" data-act="restore" data-key="${key}">복원</button>
            <button type="button" data-act="copy" data-key="${key}">안내</button>`;
    }
    const isProtectedAdmin =
      lic.license_key === "ADMIN-TEST" || lic.license_key === "ADMIN-GEMINI";
    return `
            <button type="button" data-act="editnote" data-key="${key}">수정</button>
            <button type="button" data-act="savenote" data-key="${key}">저장</button>
            <button type="button" data-act="copy" data-key="${key}">안내</button>
            <button type="button" data-act="extend30" data-key="${key}">+30일</button>
            <button type="button" data-act="suspend" data-key="${key}">정지</button>
            <button type="button" data-act="activate" data-key="${key}">활성</button>
            ${
              isProtectedAdmin
                ? ""
                : `<button type="button" class="btn-danger" data-act="delete" data-key="${key}">삭제</button>`
            }`;
  }

  async function loadList() {
    const qs = listView === "deleted" ? "?deleted=true" : "";
    const data = await admin(`/admin/licenses${qs}`);
    const list = data.licenses || [];
    deletedCount = Number(data.deleted_count || 0);
    updateListChrome();
    if (!list.length) {
      els.rows.innerHTML = `<tr><td colspan="9" class="empty-row">${
        listView === "deleted" ? "삭제된 라이선스가 없습니다." : "표시할 라이선스가 없습니다."
      }</td></tr>`;
      return;
    }
    els.rows.innerHTML = list
      .map((lic) => {
        const key = lic.license_key;
        const suspended = lic.status === "suspended";
        const rowClass = suspended ? "row-suspended" : "";
        return `<tr class="${rowClass}">
          <td><code>${escapeHtml(key)}</code></td>
          <td>${escapeHtml(lic.plan_label || lic.plan)}</td>
          <td>${escapeHtml(startText(lic))}</td>
          <td>${escapeHtml(endText(lic))}</td>
          <td><span class="status-badge status-${escapeHtml(lic.status)}">${escapeHtml(
            statusLabel(lic.status),
          )}</span></td>
          <td>${lic.daily_used ?? 0}/${lic.daily_limit}</td>
          <td>${lic.monthly_used ?? 0}/${lic.monthly_limit}</td>
          <td class="note-cell">
            <input class="note-edit" value="${escapeHtml(lic.note || "")}" ${
              listView === "deleted" ? "readonly" : ""
            } />
            <span class="note-state"></span>
          </td>
          <td class="actions">${rowActions(lic)}
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
    listView = "active";
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
      listView = "active";
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
  els.deletedViewBtn.addEventListener("click", () => {
    listView = "deleted";
    loadList().catch((e) => alert(e.message));
  });
  els.activeViewBtn.addEventListener("click", () => {
    listView = "active";
    loadList().catch((e) => alert(e.message));
  });
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
    if (!input || input.readOnly) return;
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
      if (btn.dataset.act === "delete") {
        if (!confirm(`${key} 를 삭제 목록으로 옮길까요?\n(완전 삭제가 아니라 따로 모아둡니다)`)) {
          return;
        }
        await admin(`/admin/licenses/${encodeURIComponent(key)}/delete`, { method: "POST" });
        els.issueMsg.hidden = false;
        els.issueMsg.textContent = `${key} 삭제 목록으로 이동`;
      }
      if (btn.dataset.act === "restore") {
        await admin(`/admin/licenses/${encodeURIComponent(key)}/restore`, { method: "POST" });
        els.issueMsg.hidden = false;
        els.issueMsg.textContent = `${key} 복원됨`;
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
