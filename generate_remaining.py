import os, requests, base64, time

with open('/Users/kencheng/workspace/vs code/minimax-image-gen/.env') as f:
    for line in f:
        if line.startswith('MINIMAX_API_KEY'):
            API_KEY = line.strip().split('=')[1]
            break

headers = {'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'}
OUT_DIR = '/Users/kencheng/workspace/friendly-classroom-v2/assets/images/scenarios'
os.makedirs(OUT_DIR, exist_ok=True)

uniform = ("Hong Kong primary school uniform: powder blue striped sailor collar dress for girls, "
           "white shirt grey trousers for boys, yellow PE top, "
           "simple cartoon style, bright colors, clean background, no text, no logos, 16:9")

all_images = [
    ("s-h1", "你發現有人係班Group度發你既相，加啱衰caption全班笑你"),
    ("s-h2", "你發現小傑爆咗你既秘密出去，全班笑你"),
    ("s-h3", "你同表弟一齊打電玩，表弟話：「你住手！我話晒點玩！」"),
    ("s-h5", "WhatsApp family group入面，大家傾trip既時候冇叫埋你..."),
    ("s-b3", "你跑既時候唔小心撞跌咗小美，佢膝頭哥擦損埋..."),
    ("s-b4", "你想join既同學玩，但佢話：「你呢個人曳曳，我们唔想你join」"),
    ("s-c3", "考試既時候，你見到隔離同學想睇你既答案..."),
    ("s-c4", "功課冇做，你諗緊如果要呃老師話「唔記得帶」..."),
    ("s-c5", "你發現你最好的朋友小明正在抄隔壁同學的答案。他成績一向不太好，如果被發現一定會被記過。你應該點做？"),
    ("s-c6", "你在走廊執到一百元，幾張紅色鈔票。你抬頭望見小明正低頭走過，唔知係咪佢丢既。你應該點做？"),
    ("s-c7", "你在同學群組看到有人post咗小宇的醜相片，大家都在笑。你知呢張相片係被恶意PS過的，但係小宇唔知件事。你應該點做？"),
    ("s-c8", "你不小心撞跌咗同學的文具，整爛咗佢最鐘意的筆。你認為老師不會發現係你，但係你內心知道應該承認。你應該點做？"),
    ("s-c9", "老師表揚咗你今次考試做得好，但你心知肚明，小明先係真正答啱大多數題目既人——你只係抄咗佢。你應該點做？"),
    ("s-door1", "放學時，大家爭住冲出去。門口有兩個人：一個係要出去既同學，另一個係老師。老師話：「排隊，先出先後。」但前面既小明話：「我趕時間！」然後衝埋去門口。你呢？"),
    ("s-door2", "你見到祝卓鋒喺走廊度爬嚟爬去，仲拉住門邊既欄杆。你知道門好快就會開，呢個係危險行為。你應該點做？"),
    ("s-door3", "午休時，你見到門係開住，但外面好嘈，有啲同學喺走廊跑嚟跑去。風吹啲紙張周圍飛。老師未返課室。你應該點做？"),
    ("s-door4", "放學時，老師遲遲未開門。大家喺門口等緊，好嘈吵。小明話：「不如我自己開啦！」但老師未允許。你點睇？"),
    ("s-door6", "上堂時，有人走咗出去但冇閂門。老師望咗一下皺眉，但冇出聲。祝卓鋒走咗去閂門，但用力太大，門好大聲。全部人望住老師..."),
    ("s-new1", "小明發現自己廁紙唔夠，向你借。你今日得少量，但足夠自己用..."),
    ("s-new2", "到你排隊拎飯既時候，有人突然插入你前面。你認出佢係高年級既大舊..."),
    ("s-new4", "放學時突然落大雨，你帶咗遮，但同學小美冇帶，佢望住天有啲發愁..."),
    ("s-new5", "體育課試跳遠，你見到另一組既小杰係度呃老師，話自己跳咗幾遠，但明明就差啲..."),
    ("s-new6", "你排緊隊，前面既小福突然話：「衰咗，我唔記得带銀包！」佢望住你..."),
    ("s-new8", "朝早老師話：「邊個未做完功课？」你心知自己就係其中一個，但你真係唔記得带張紙..."),
    ("s-new9", "你整爛咗洗手間門口個鏡，心諗：「冇人仔注意到呢...」但你心知道自己衰咗..."),
    ("s-new10", "今日有新同學小玲轉過來，佢坐係一角冇人理。你听到其他同學話：「呢個係新來ga咋嘛...」"),
    ("s-new11", "你借咗圖書館本書，到期咗都未睇完，本嚟可以攤30日，但圖書館話比你攤2本，你已經攤晒..."),
    ("s-new12", "足球比賽，小璋話你打佢，但你只係輕輕掽咗佢一下。佢向老師告你好大打人..."),
    ("s-new13", "你整爛咗窗簾，但冇人睇到。老師問：「係邊個整爛嘅？」..."),
    ("s-new15", "分組做 project，你發覺組員小明成日發夢，唔做嘢..."),
    ("s-new16", "同學小琳分享佢既畫，你覺得好樣衰，想笑..."),
    ("s-new17", "同學小華話佢屋企有事，聲音好細咁講，你專心睇書..."),
    ("s-new18", "你排籃球時唔小心整跌咗另一位同學，佢整損咗膝頭..."),
    ("s-new19", "你見到幾個同學埋堆笑一位同學，仲話低價錢要整佢..."),
    ("s-new20", "老師問你同學小張既答案你係咪幫咗佢，你答係..."),
    ("s-new22", "今日係你值日，但你好想走咗去同朋友玩..."),
]

count = 0
for name, desc in all_images:
    out = f"{OUT_DIR}/{name}.png"
    if os.path.exists(out):
        print(f"skip {name} - exists")
        continue
    prompt = f"{desc} {uniform}"
    print(f"Generating {name}: {desc[:30]}...")
    payload = {'model': 'image-01', 'prompt': prompt, 'aspect_ratio': '16:9', 'response_format': 'base64'}
    try:
        resp = requests.post('https://api.minimax.io/v1/image_generation', headers=headers, json=payload, timeout=120)
        data = resp.json()
        data_data = data.get('data')
        if data_data is None:
            code = data.get('base_resp', {}).get('status_code', 0)
            msg = data.get('base_resp', {}).get('status_msg', 'unknown')
            print(f"  ERROR {code}: {msg}")
            if code == 2056:
                print("Quota exhausted - stopping")
                break
            continue
        b64_list = data_data.get('image_base64', [])
        img_bytes = base64.b64decode(b64_list[0]) if isinstance(b64_list, list) else base64.b64decode(b64_list)
        with open(out, 'wb') as f:
            f.write(img_bytes)
        print(f"  OK: {name}")
        count += 1
    except Exception as e:
        print(f"  EXCEPTION: {e}")
    time.sleep(3)

print(f"\nDone! Generated {count} new images. Total in folder: {len([f for f in os.listdir(OUT_DIR) if f.endswith('.png')])}")