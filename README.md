<div align="center">

# 안녕하세요! 저는 sjr-ictk입니다 👋

![Profile views](https://komarev.com/ghpvc/?username=sjr-ictk&label=Profile%20views&color=79c83d&style=flat)

</div>

> **작업량은 아래 「최근 1년 커밋」 표가 기준입니다.**  
> 스트릭/그래프 이미지(1·1·3 등)는 GitHub **프로필 초록 칸**만 세며, private·조직 레포 대부분은 **포함되지 않습니다.**

---

## 📌 최근 1년 커밋 (private/조직 레포 · API 집계)

<!--START_SECTION:recent-commits-->
_아직 자동 집계 전입니다. [Actions에서 “Update recent commits” 실행](#-private조직-레포-커밋-자동-반영) 후 **최근 365일** 표가 채워집니다._
<!--END_SECTION:recent-commits-->

---

<details>
<summary>📊 GitHub 프로필 위젯 (초록 칸만 · 참고용)</summary>

<div align="center">

![GitHub streak](https://streak-stats.demolab.com/?user=sjr-ictk&theme=tokyonight&hide_border=true&include_all_commits=true)

<img
  height="180em"
  alt="GitHub contribution activity graph"
  src="https://github-readme-activity-graph.vercel.app/graph?username=sjr-ictk&bg_color=1a1b27&color=70a5fd&line=bf91f3&point=38bdae&area=true&hide_border=true&include_all_commits=true"
/>

</div>

- **Settings → Profile → Include private contributions** 를 켜도, 조직 private 레포는 그래프에 안 잡히는 경우가 많습니다.
- 숫자가 적게 나오는 것은 **만료 PAT·미설정 TRACK_REPOS** 문제가 아니라, **위젯 종류의 한계**입니다.

</details>

---

<details>
<summary>🔧 Private/조직 레포 커밋 자동 반영</summary>

1. **PAT** (classic `repo` 또는 fine-grained **Contents: Read** + org SSO authorize)
2. **Secrets** → `GH_TOKEN`
3. **Variables** → `TRACK_REPOS` = `owner/audit-log-manager,owner/audit-log-server`
4. (선택) **Variables** → `DAYS` = `365` (기본값 365, 더 짧게 쓰려면 예: `90`)
5. **Actions** → **Update recent commits (private/org repos)** → **Run workflow**

매일 UTC 01:00에 README가 갱신됩니다. 90일 초과 시 일별 대신 **월별** 표로 출력합니다.

</details>

<details>
<summary>📈 stats / 언어 / 스네이크 등 (선택)</summary>

- 통계·언어: `https://github-readme-stats.vercel.app/api?username=sjr-ictk&count_private=true&include_all_commits=true`
- 스네이크: `.github/workflows/snake.yml` 실행 후 `output` 브랜치
- Early Bird: `.github/workflows/productive-box.yml` + `GH_TOKEN`, `GIST_ID`

</details>
