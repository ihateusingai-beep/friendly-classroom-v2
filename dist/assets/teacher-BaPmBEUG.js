import{g as s,a as c}from"./index-C3OnFq86.js";const v={};function g(){return`
    <div class="container fade-in">
      <div class="login-form">
        <h2 style="text-align:center;margin-bottom:20px">🔐 老師登入</h2>
        <input id="teacher-pw" type="password" placeholder="輸入密碼" />
        <button class="btn btn-primary" style="width:100%" onclick="FC.doLogin()">登入</button>
        <p id="login-error" style="color:var(--danger);text-align:center;margin-top:8px;display:none">密碼錯誤</p>
        <div style="margin-top:12px;text-align:center">
          <button class="btn btn-outline" onclick="FC.goRoleSelect()">← 返回</button>
        </div>
      </div>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `}function m(){const o=s();return o.length?`
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goRoleSelect()">←</button>
        <h2>📊 老師儀表板</h2>
      </div>

      <div class="teacher-panel">
        <h2>👥 學生總覽</h2>
        <div class="subtitle">共 ${o.length} 位學生</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px">
        ${o.map(t=>{var i;const e=t.totalMoralScore||0,n=((i=t.completedScenarios)==null?void 0:i.length)||0,r=v[t.name]||"👤",d=e>=200?"🌟":e>=100?"⭐":e>=50?"✨":"💫";return`
          <div class="student-row">
            <div class="avatar">${r}</div>
            <div class="info">
              <div class="name">${t.name}</div>
              <div class="meta">完成 ${n} 個場景 · 最近 ${t.lastPlayed||"—"}</div>
            </div>
            <div class="stat-badge">
              <div class="num" style="color:${e>=100?"#52c41a":"var(--text)"}">${e}</div>
              <div class="label">道德分</div>
            </div>
            <div style="font-size:1.2em">${d}</div>
          </div>`}).join("")}
      </div>

      <div class="card" style="margin-top:16px">
        <div style="font-weight:600;margin-bottom:10px">📚 科目總覽</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
          ${c().map(t=>{const e=o.reduce((d,i)=>{var l,a;return d+(((a=(l=i.subjectProgress)==null?void 0:l[t.id])==null?void 0:a.completed)||0)},0),n=o.reduce((d,i)=>{var l,a;return d+(((a=(l=i.subjectProgress)==null?void 0:l[t.id])==null?void 0:a.total)||0)},0),r=n?Math.round(e/n*100):0;return`
              <div style="background:${t.color}18;border:2px solid ${t.color};border-radius:12px;padding:12px;text-align:center">
                <div style="font-size:1.5em;margin-bottom:4px">${t.emoji}</div>
                <div style="font-weight:700;font-size:1.1em;color:${t.color}">${e}/${n}</div>
                <div style="height:6px;background:#eee;border-radius:3px;margin-top:6px;overflow:hidden">
                  <div style="height:100%;width:${r}%;background:${t.color};border-radius:3px"></div>
                </div>
              </div>`}).join("")}
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">📥 匯入學生數據</div>
        <p style="font-size:0.85em;color:var(--text-light);margin-bottom:8px">選擇學生之前匯出的 .json 檔案</p>
        <input type="file" accept=".json" onchange="FC.handleImport(event)" style="margin-bottom:10px" />
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">📤 匯出全班數據</div>
        <button class="btn btn-success" onclick="FC.exportAll()">📤 匯出全班</button>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">⚙️ 老師設定</div>
        <p style="font-size:0.85em;color:var(--text-light);margin-bottom:8px">控制學生的功能開關、課題範圍、PIN</p>
        <button class="btn btn-primary" onclick="FC.goTeacherAssign()">⚙️ 功能設定</button>
      </div>

      <div style="margin-top:16px">
        <button class="btn btn-outline" onclick="FC.goRoleSelect()">← 返回首頁</button>
      </div>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `:`
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goRoleSelect()">←</button>
        <h2>📊 老師儀表板</h2>
      </div>
      <div class="teacher-panel">
        <h2>📊 老師儀表板</h2>
        <div class="subtitle">暂无学生数据</div>
      </div>
      <div style="text-align:center;padding:40px;color:var(--text-light)">
        <div style="font-size:3em;margin-bottom:12px">📭</div>
        <p>暫時沒有學生數據</p>
        <p style="font-size:0.85em;margin-top:8px">學生完成學習後會自動顯示在這裡</p>
      </div>
      <div style="margin-top:16px">
        <button class="btn btn-outline" onclick="FC.goRoleSelect()">← 返回首頁</button>
      </div>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>`}export{g as renderLogin,m as renderTeacher};
