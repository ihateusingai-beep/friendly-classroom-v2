import{g as d,a as c}from"./index-CRm96aba.js";const p={};function g(){return`
    <div class="container fade-in">
      <div class="login-form">
        <h1 style="text-align:center;margin-bottom:20px">🔐 老師登入</h1>
        <label for="teacher-pw" class="sr-only">老師密碼</label>
        <input id="teacher-pw" type="password" placeholder="輸入密碼" />
        <button type="button" class="btn btn-primary" style="width:100%" onclick="FC.doLogin()">登入</button>
        <p id="login-error" role="alert" style="color:var(--danger);text-align:center;margin-top:8px;display:none">密碼錯誤</p>
        <div style="margin-top:12px;text-align:center">
          <button type="button" class="btn btn-outline" onclick="FC.goRoleSelect()">← 返回</button>
        </div>
      </div>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `}function b(){const n=d();return n.length?`
    <div class="container fade-in">
      <div class="page-header">
        <button type="button" class="back-btn" onclick="FC.goRoleSelect()" aria-label="返回主選單">←</button>
        <h1>📊 老師儀表板</h1>
      </div>

      <div class="teacher-panel">
        <h2>👥 學生總覽</h2>
        <div class="subtitle">共 ${n.length} 位學生</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px" role="list" aria-label="學生清單">
        ${n.map(t=>{var i;const e=t.totalMoralScore||0,a=((i=t.completedScenarios)==null?void 0:i.length)||0,l=p[t.name]||"👤",o=e>=200?"🌟":e>=100?"⭐":e>=50?"✨":"💫";return`
          <div class="student-row" role="listitem" aria-label="學生 ${t.name}，完成 ${a} 個場景，最近 ${t.lastPlayed||"—"}，道德分 ${e}，等級 ${o}">
            <span class="avatar" aria-hidden="true">${l}</span>
            <span class="info">
              <span class="name">${t.name}</span>
              <span class="meta">完成 ${a} 個場景 · 最近 ${t.lastPlayed||"—"}</span>
            </span>
            <span class="stat-badge">
              <span class="num" style="color:${e>=100?"#15803d":"var(--text)"}">${e}</span>
              <span class="label">道德分</span>
            </span>
            <span style="font-size:1.2em" aria-hidden="true">${o}</span>
          </div>`}).join("")}
      </div>

      <div class="card" style="margin-top:16px">
        <div style="font-weight:600;margin-bottom:10px">📚 科目總覽</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px" role="list" aria-label="科目總覽">
          ${c().map(t=>{const e=n.reduce((o,i)=>{var r,s;return o+(((s=(r=i.subjectProgress)==null?void 0:r[t.id])==null?void 0:s.completed)||0)},0),a=n.reduce((o,i)=>{var r,s;return o+(((s=(r=i.subjectProgress)==null?void 0:r[t.id])==null?void 0:s.total)||0)},0),l=a?Math.round(e/a*100):0;return`
              <div style="background:${t.color}18;border:2px solid ${t.color};border-radius:12px;padding:12px;text-align:center" role="listitem"
                aria-label="${t.title}，全班完成 ${e}/${a} 題，${l}%">
                <div style="font-size:1.5em;margin-bottom:4px" aria-hidden="true">${t.emoji}</div>
                <div style="font-weight:700;font-size:1.1em;color:${t.color}">${e}/${a}</div>
                <div style="height:6px;background:#eee;border-radius:3px;margin-top:6px;overflow:hidden" role="progressbar"
                  aria-valuenow="${l}" aria-valuemin="0" aria-valuemax="100" aria-label="${t.title} 全班進度">
                  <div style="height:100%;width:${l}%;background:${t.color};border-radius:3px"></div>
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
        <button type="button" class="btn btn-success" onclick="FC.exportAll()">📤 匯出全班</button>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">⚙️ 老師設定</div>
        <p style="font-size:0.85em;color:var(--text-light);margin-bottom:8px">控制學生的功能開關、課題範圍、PIN</p>
        <button type="button" class="btn btn-primary" onclick="FC.goTeacherAssign()">⚙️ 功能設定</button>
      </div>

      <div style="margin-top:16px">
        <button type="button" class="btn btn-outline" onclick="FC.goRoleSelect()">← 返回首頁</button>
      </div>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `:`
    <div class="container fade-in">
      <div class="page-header">
        <button type="button" class="back-btn" onclick="FC.goRoleSelect()" aria-label="返回主選單">←</button>
        <h1>📊 老師儀表板</h1>
      </div>
      <div class="teacher-panel">
        <h2 class="sr-only">📊 老師儀表板</h2>
        <div class="subtitle">暫無學生數據</div>
      </div>
      <div style="text-align:center;padding:40px;color:var(--text-light)">
        <div style="font-size:3em;margin-bottom:12px" aria-hidden="true">📭</div>
        <p>暫時沒有學生數據</p>
        <p style="font-size:0.85em;margin-top:8px">學生完成學習後會自動顯示在這裡</p>
      </div>
      <div style="margin-top:16px">
        <button type="button" class="btn btn-outline" onclick="FC.goRoleSelect()">← 返回首頁</button>
      </div>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>`}export{g as renderLogin,b as renderTeacher};
