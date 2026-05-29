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

## 실데이터 / 실시간 연동 (다음 단계 옵션)
- `lib/data.js` 의 `DEFAULT_DATA` 를 교체하거나, API Route(`app/api/...`)에서 구글시트/DB를 fetch 하도록 바꾸면 자동 갱신·실시간 가능.
- 목표값은 `lib/data.js` 의 `TARGETS` 수정.

## 기술 스택
Next.js 14 (App Router) · React 18 · ECharts 5 · SheetJS(xlsx). 다크 벤토 테마는 `app/globals.css`.
