#!/bin/bash
# TTS batch generation for Friendly Classroom V2
# Voice: Cantonese_GentleLady (Hong Kong Cantonese)

AUDIO_DIR="/Users/kencheng/workspace/friendly-classroom-v2/public/audio"
MMX="/Users/kencheng/.hermes/node/bin/mmx"
VOICE="Cantonese_GentleLady"

log() { echo "[$(date '+%H:%M:%S')] $1"; }

log "=== Starting TTS batch generation ==="

# Scenarios (46 files)
SCENARIOS=(
  "s1:關卡1：嘲笑同學。小傑指著正在玩既小宇話：「我哋一齊笑佢好唔好？佢著既衫咁樣好搞笑呀！」"
  "s2:關卡2：幫手匿贓。小強拉著你話：「幫我一個忙，我啱先拎咗啱嘢既玩具車，帮我匿埋佢！」"
  "s3:關卡3：新朋友。小美最近成日同新同學玩，都唔理你啦。你覺得心裡酸酸地..."
  "s4:關卡4：邊個整跌既花盆？你見到小強唔小心整跌咗老師既花盆，但係佢同老師話：「係風吹跌既！」"
  "s5:關卡5：整蠱仔。小芳偷偷同你講：「我哋將安安既水壺匿埋，等佢搵唔到好好笑！」"
  "s6:關卡6：午餐時既爭執。午膳時，小華突然坐到你旁邊話：「呢個位係我既，你走開！」"
  "s7:關卡7：網上留言。小美發現有人喺學校嘅Facebook群組入面post咗一張被改圖過嘅相，照片入面既人就係佢..."
  "s8:關卡8：體育堂既衝突。體育堂上，小彬因為小事同學爆粗口，老師行埋嚟問：「發生咩事？」"
  "s9:關卡9：利是錢。你新年收到利是，表哥走過嚟話：「你咁多利是，點解唔分啲俾我？」"
  "s10:關卡10：自私既隊友。分組做project，你發現其中一個組員完全唔做嘢，只係坐喺度打機..."
  "s11:關卡11：撞到人。小明跑住去食堂，唔小心撞低咗捧住餐盤既小美，午餐洒到一褲都係..."
  "s12:關卡12：傾偈唔睇路。你與同學傾得興起，完全冇留意前面，结果撞到牆上..."
  "s13:關卡13：拖慢哋補抄。測驗完咗，你仲有一題未做完，但係已經有同學係咁催你..."
  "s14:關卡14：唔記得帶功課。你今朝出門先發現自己唔記得帶功課，返到學校正後悔..."
  "s15:關卡15：整污糟咗人哋本書。你喺圖書館唔小心整污糟咗同學本借嚟睇嘅書..."
  "s16:關卡16：抄橋。你見到你最好成績既同學抄橋，你應該點做？"
  "s17:關卡17：當時鐘指針指向上課時間，你冲入課室，老師已經開始講書..."
  "s18:關卡18：執書包。你見到有同學書包跌咗，裡面啲嘢散滿一地..."
  "s19:關卡19：借錢。你嘅好朋友仔最近成日問你借錢..."
  "s20:關卡20：秘密。你無意中聽到朋友計劃緊作弊..."
  "s21:關卡21：被誤解。你做嘢好叻，但係老師以為你係夾答案..."
  "s22:關卡22：被遺漏。你發現小組討論時，你永遠都被遺漏..."
  "s23:關卡23：朋友背叛。你以為嘅好朋友喺你背後講你壞話..."
  "s24:關卡24：考試前夕。你發現自己完全冇準備好聽日嘅考試..."
  "s25:關卡25：嫉妒。你嘅好朋友轉咗去另一間學校，佢喺新學校拎咗好多獎..."
  "s26:關卡26：被比較。你爸媽成日話：「你睇吓隔離嗰個，佢讀書幾好！」"
  "s27:關卡27：失敗。你辛苦準備咗好耐嘅比賽，最後拎咗最後一名..."
  "s28:關卡28：失望。你滿心期待嘅活動突然被取消..."
  "s29:關卡29：被嘲笑。你喺課室入面被同學當眾嘲笑..."
  "s30:關卡30：被孤立。你發現自己喺WhatsApp group入面被踢走..."
  "s31:關卡31：被比較。你嘗試解釋但係冇人信..."
  "s32:關卡32：被否定。你提出嘅想法被老師和同學話為唔可能..."
  "s33:關卡33：被排斥。你發現大家 groupings 時唔小心漏咗你..."
  "s34:關卡34：被嘲笑。你有個綽號，而且越嚟越多人跟住叫..."
  "s35:關卡35：不被看見。你努力舉手，但老師從來未請過你..."
  "s36:關卡36：被否認。你做啲咩都被人話係想出風頭..."
  "s37:關卡37：被操控。朋友叫你幫佢做作業..."
  "s38:關卡38：被監視。你發现老師特別關注你..."
  "s39:關卡39：被質疑。你解釋但係冇人信..."
  "s40:關卡40：被标签。你唔想做啲咩但係已經被定義..."
  "s41:關卡41：被威脅。有同學叫你唔好告密否則會打你..."
  "s42:關卡42：被毀謗。有人在網上散播關於你嘅謠言..."
  "s43:關卡43：被沒收。教師沒收你認為係你嘅個人物品..."
  "s44:關卡44：被過度管教。你覺得老師對你特別嚴格..."
  "s45:關卡45：被歧視。有同學因為你嘅背景而睇你唔起..."
  "s46:關卡46：被誤解。你的意圖被完全扭曲..."
)

# Creeds (10 files)
CREEDS=(
  "creed-1:守法的：我們是守法的：遵守校規，奉公守法"
  "creed-2:信實的：我們是信實的：誠實負責，不欺騙人"
  "creed-3:整潔的：我們是整潔的：校服整潔，儀容端正"
  "creed-4:友愛的：我們是友愛的：關心別人，互相幫助"
  "creed-5:禮讓的：我們是禮讓的：待人有禮，不易發怒"
  "creed-6:勤力的：我們是勤力的：上課專心，努力學習"
  "creed-7:合作的：我們是合作的：遵守規則，積極參與"
  "creed-8:獨立的：我們是獨立的：自己的事，自己去做"
  "creed-9:愛護學校的：我們是愛護學校的：愛護公物，保護環境"
  "creed-10:感恩的：我們是感恩的：尊敬師長，孝順父母"
)

count=0
total=56

# Generate scenario audio
for entry in "${SCENARIOS[@]}"; do
  id="${entry%%:*}"
  text="${entry#*:}"
  count=$((count+1))
  log "[$count/$total] Generating $id..."
  $MMX speech synthesize --voice "$VOICE" --text "$text" --out "$AUDIO_DIR/scenarios/$id.mp3" 2>&1 | grep -v "^\[Model"
  if [ -f "$AUDIO_DIR/scenarios/$id.mp3" ]; then
    size=$(stat -f%z "$AUDIO_DIR/scenarios/$id.mp3" 2>/dev/null || stat -c%s "$AUDIO_DIR/scenarios/$id.mp3" 2>/dev/null)
    log "  ✓ $id ($size bytes)"
  else
    log "  ✗ FAILED: $id"
  fi
done

# Generate creed audio
for entry in "${CREEDS[@]}"; do
  id="${entry%%:*}"
  text="${entry#*:}"
  count=$((count+1))
  log "[$count/$total] Generating $id..."
  $MMX speech synthesize --voice "$VOICE" --text "$text" --out "$AUDIO_DIR/creeds/$id.mp3" 2>&1 | grep -v "^\[Model"
  if [ -f "$AUDIO_DIR/creeds/$id.mp3" ]; then
    size=$(stat -f%z "$AUDIO_DIR/creeds/$id.mp3" 2>/dev/null || stat -c%s "$AUDIO_DIR/creeds/$id.mp3" 2>/dev/null)
    log "  ✓ $id ($size bytes)"
  else
    log "  ✗ FAILED: $id"
  fi
done

log "=== TTS batch complete ==="
ls -la "$AUDIO_DIR/scenarios/" | tail -5
ls -la "$AUDIO_DIR/creeds/" | tail -5