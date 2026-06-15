import{c as d,g as p,r as v,b,e as c,a as g}from"./index-C4HomOIV.js";const m={};function h(){return`
    <div class="container fade-in">
      <div class="login-form">
        <h1 style="text-align:center;margin-bottom:20px">🔐 老師登入</h1>
        <label for="teacher-pw" class="sr-only">老師密碼</label>
        <input id="teacher-pw" type="password" autocomplete="current-password" placeholder="輸入密碼" />
        <button type="button" class="btn btn-primary" class="fc-w-100" data-action="doLogin">登入</button>
        <p id="login-error" role="alert" style="color:var(--danger);text-align:center;margin-top:8px;display:none">密碼錯誤</p>
        <div style="margin-top:12px;text-align:center">
          <button type="button" class="btn btn-outline" data-action="navigate" data-arg="role-select">← 返回</button>
        </div>
      </div>
      ${d()}
    </div>
  `}function y(){const o=p();return o.length?`
    <div class="container fade-in">
      <div class="page-header">
        <button type="button" class="back-btn" data-action="navigate" data-arg="role-select" aria-label="返回主選單">←</button>
        <h1>📊 老師儀表板</h1>
      </div>

      <div class="teacher-panel">
        <h2>👥 學生總覽</h2>
        <div class="subtitle">共 ${o.length} 位學生</div>
      </div>

      <div class="fc-flex-col-gap" role="list" aria-label="學生清單">
        ${o.map(t=>{const e=b(t.name),a=e.score,n=e.completedCount,s=m[t.name]||"👤",i=a>=200?"🌟":a>=100?"⭐":a>=50?"✨":"💫";return`
          <div class="student-row" role="listitem" aria-label="學生 ${c(t.name)}，完成 ${n} 個場景，最近 ${t.lastPlayed||"—"}，道德分 ${a}，等級 ${i}">
            <span class="avatar" aria-hidden="true">${s}</span>
            <span class="info">
              <span class="name">${c(t.name)}</span>
              <span class="meta">完成 ${n} 個場景 · 最近 ${t.lastPlayed||"—"}</span>
            </span>
            <span class="stat-badge">
              <span class="num" style="color:${a>=100?"#15803d":"var(--text)"}">${a}</span>
              <span class="label">道德分</span>
            </span>
            <span style="font-size:1.2em" aria-hidden="true">${i}</span>
          </div>`}).join("")}
      </div>

      <div class="card" class="fc-mt-16">
        <div style="font-weight:600;margin-bottom:10px">📚 科目總覽</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px" role="list" aria-label="科目總覽" class="subject-grid">
          ${g().map(t=>{const e=o.reduce((s,i)=>{var l,r;return s+(((r=(l=i.subjectProgress)==null?void 0:l[t.id])==null?void 0:r.completed)||0)},0),a=o.reduce((s,i)=>{var l,r;return s+(((r=(l=i.subjectProgress)==null?void 0:l[t.id])==null?void 0:r.total)||0)},0),n=a?Math.round(e/a*100):0;return`
              <div style="background:${t.color}18;border:2px solid ${t.color};border-radius:12px;padding:12px;text-align:center" role="listitem"
                aria-label="${t.title}，全班完成 ${e}/${a} 題，${n}%">
                <div style="font-size:1.5em;margin-bottom:4px" aria-hidden="true">${t.emoji}</div>
                <div style="font-weight:700;font-size:1.1em;color:${t.color}">${e}/${a}</div>
                <div style="height:6px;background:#eee;border-radius:3px;margin-top:6px;overflow:hidden" role="progressbar"
                  aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="100" aria-label="${t.title} 全班進度">
                  <div style="height:100%;width:${n}%;background:${t.color};border-radius:3px"></div>
                </div>
              </div>`}).join("")}
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">📥 匯入學生數據</div>
        <p style="font-size:0.85em;color:var(--text-light);margin-bottom:8px">選擇學生之前匯出的 .json 檔案</p>
        <label for="teacher-import-file" class="sr-only">匯入學生資料檔案</label>
        <input id="teacher-import-file" type="file" accept=".json" onchange="FC.handleImport(event)" style="margin-bottom:10px" />
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">📤 匯出全班數據</div>
        <button type="button" class="btn btn-success" data-action="exportAll">📤 匯出全班</button>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">⚙️ 老師設定</div>
        <p style="font-size:0.85em;color:var(--text-light);margin-bottom:8px">控制學生的功能開關、課題範圍、PIN</p>
          <button type="button" class="btn btn-primary" data-action="navigate" data-arg="teacher-assign">⚙️ 功能設定</button>
      </div>

      <div class="fc-mt-16">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="role-select">← 返回首頁</button>
      </div>
      ${d()}
    </div>
  `:`
    <div class="container fade-in">
      <div class="page-header">
        <button type="button" class="back-btn" data-action="navigate" data-arg="role-select" aria-label="返回主選單">←</button>
        <h1>📊 老師儀表板</h1>
      </div>
      <div class="teacher-panel">
        <h2 class="sr-only">📊 老師儀表板</h2>
        <div class="subtitle">暫無學生數據</div>
      </div>
      ${v({emoji:"📭",title:"暫時沒有學生數據",hint:"學生完成學習後會自動顯示在這裡"})}
      <div class="fc-mt-16">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="role-select">← 返回首頁</button>
      </div>
      ${d()}
    </div>`}export{h as renderLogin,y as renderTeacher};
