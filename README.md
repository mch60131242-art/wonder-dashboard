# WONDER 마케팅 대시보드 (Next.js + Vercel)

벤토(Bento) 스타일 다크 대시보드. 5개 페이지 + 엑셀/CSV 업로드.

## 페이지
- `/` ① 핵심 KPI (DB 달성률 게이지·소진액·CPA·미니KPI·추이·매체)
- `/funnel` ② 퍼널 흐름
- `/media` ③ 매체별 성과·예산
- `/best` ④ 우수 채널 (효율 사분면)
- `/trend` ⑤ 추이

## 로컬 실행
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 배포 빌드 검증
```

## Vercel 배포 (공개 URL)
1. 이 폴더를 **GitHub 저장소**로 push
   ```bash
   git init && git add . && git commit -m "init"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. **vercel.com → Add New → Project → GitHub 저장소 import** → Framework "Next.js" 자동 인식 → **Deploy**
3. 끝. 자동으로 `https://<프로젝트명>.vercel.app` URL 발급.

### ✅ URL에 `wonder-dashboard` 넣기
- 배포 URL은 **Vercel 프로젝트 이름** 기준입니다. import 시 **Project Name = `wonder-dashboard`** 로 두면 → **`https://wonder-dashboard.vercel.app`** (이름이 비어있을 때).
- 이미 누가 선점했으면 `wonder-dashboard-xxxx.vercel.app` 형태가 됩니다. → **Settings → Domains** 에서 원하는 `*.vercel.app` 별칭을 추가하거나, **Settings → General → Project Name** 변경으로 조정.
- 커스텀 도메인(예: dashboard.회사도메인.com)도 Settings → Domains 에서 연결 가능.
- (package.json 의 name 도 이미 `wonder-dashboard` 로 맞춰둠.)

## 엑셀/CSV 업로드 (그대로 유지)
- 상단 **📂 엑셀/CSV 불러오기** 버튼 → `fact_daily` 형식 파일 선택 → 전 페이지 자동 갱신.
- 필요한 컬럼(첫 시트): `date, channel, spend, impressions, clicks, app_installs, signups, exam_applications, exams_taken, passes, appointments, active_retained`
- 업로드 데이터는 브라우저 메모리에만 존재(새로고침 시 더미로 복귀). 영구 저장이 필요하면 아래 "실데이터 연동" 참고.

## ★ 구글시트 연동 — URL 가진 모두에게 데이터 공유
시트를 수정하면 **URL을 가진 모든 사람**에게 반영됩니다 (서버가 시트를 읽어옴, 약 5분마다 갱신).

### 1) 구글시트 준비
- 새 구글시트 → 첫 행(헤더)에 정확히 이 컬럼:
  `date, channel, spend, impressions, clicks, app_installs, signups, exam_applications, exams_taken, passes, appointments, active_retained`
- 엑셀 데이터는 이 시트에 붙여넣으면 됩니다.

### 2) 시트를 CSV로 "웹에 게시"
- 구글시트 → **파일 → 공유 → 웹에 게시(Publish to web)**
- **게시 대상 = 해당 시트**, **형식 = 쉼표로 구분된 값(.csv)** 선택 → **게시**
- 나오는 URL 복사 (형식: `https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv`)

### 3) Vercel 환경변수 등록
- Vercel → 프로젝트 → **Settings → Environment Variables**
- 이름 **`SHEET_CSV_URL`**, 값 = 위 CSV URL → 저장 → **Redeploy**

→ 이제 시트를 고치면 약 5분 내 전체 대시보드에 반영됩니다.
(환경변수 미설정 시엔 내장 더미 데이터로 동작. 상단 "엑셀/CSV 불러오기" 버튼은 *내 화면 임시 미리보기*용이며 남에게 공유되지 않음.)

- 갱신 주기 조정: `app/api/data/route.js` 의 `revalidate = 300`(초) 수정.
- 목표값(2,300·15만 등): `lib/data.js` 의 `TARGETS` 수정.

## 기술 스택
Next.js 14 (App Router) · React 18 · ECharts 5 · SheetJS(xlsx). 다크 벤토 테마는 `app/globals.css`.
