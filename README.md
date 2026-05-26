<div align="center">

# 안녕하세요! 저는 sjr-ictk입니다 👋

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fsjr-ictk&count_bg=%2379C83D&title_bg=%23555555&icon=github.svg&icon_color=%23E7E7E7&title=visitors&edge_flat=false)](https://github.com/sjr-ictk)

</div>

---

## 🌅 일찍 일어나는 개발자예요

> 아래 카드는 GitHub 커밋 시간을 분석해서 자동으로 업데이트됩니다.
> 설정 방법은 [아래](#-early-bird-세팅-방법)를 참고해주세요.

<!--START_SECTION:productive-box-->
<!--END_SECTION:productive-box-->

---

## 📊 GitHub 통계

<div align="center">
  <img height="180em"
    src="https://github-readme-stats.vercel.app/api?username=sjr-ictk&show_icons=true&theme=tokyonight&include_all_commits=true&count_private=true&hide_border=true"
  />
  <img height="180em"
    src="https://github-readme-stats.vercel.app/api/top-langs/?username=sjr-ictk&layout=compact&theme=tokyonight&hide_border=true&langs_count=8&count_private=true&include_all_commits=true"
  />
</div>

<div align="center">
  <img
    src="https://github-readme-streak-stats.herokuapp.com/?user=sjr-ictk&theme=tokyonight&hide_border=true&include_all_commits=true"
  />
</div>

---

## 🏆 GitHub 트로피

<div align="center">
  <img
    src="https://github-profile-trophy.vercel.app/?username=sjr-ictk&theme=tokyonight&no-frame=true&no-bg=true&margin-w=4&row=1"
  />
</div>

---

## 📈 기여 그래프

<div align="center">
  <img
    src="https://github-readme-activity-graph.vercel.app/graph?username=sjr-ictk&bg_color=1a1b27&color=70a5fd&line=bf91f3&point=38bdae&area=true&hide_border=true&include_all_commits=true"
  />
</div>

---

## 🐍 기여 스네이크

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)"
      srcset="https://raw.githubusercontent.com/sjr-ictk/sjr-ictk/output/github-contribution-grid-snake-dark.svg"
    />
    <source media="(prefers-color-scheme: light)"
      srcset="https://raw.githubusercontent.com/sjr-ictk/sjr-ictk/output/github-contribution-grid-snake.svg"
    />
    <img
      alt="github contribution grid snake animation"
      src="https://raw.githubusercontent.com/sjr-ictk/sjr-ictk/output/github-contribution-grid-snake.svg"
    />
  </picture>
</div>

---

<details>
<summary>🔒 Private 기여가 카드에 안 보일 때</summary>

- GitHub **Settings → Profile** 에서 **Include private contributions on my profile** 를 켜두세요. (공개 API·위젯이 private 커밋을 셀 때 필요)
- `count_private` / `include_all_commits` 는 위젯마다 지원 방식이 다릅니다. **github-readme-stats**(통계·언어)는 공개 Vercel 인스턴스만으로는 private **저장소 메타**(스타·포크 수 등)가 제한될 수 있고, **커밋·기여 수**는 프로필 설정이 켜져 있으면 반영되는 경우가 많습니다.
- Early Bird(**productive-box**)는 Actions의 `GH_TOKEN`에 **repo** 권한이 있으면 private 레포 커밋 시간도 분석에 포함됩니다.

</details>

<details>
<summary>⚙️ Early Bird 세팅 방법</summary>

### productive-box 설정 (🌅 일찍 일어나는 사람이에요 카드)

1. **빈 Gist 생성**
   - [gist.github.com](https://gist.github.com) 에서 아무 내용이나 넣고 public gist 생성
   - 생성된 Gist의 ID(URL 마지막 부분)를 복사

2. **Personal Access Token 생성**
   - GitHub → Settings → Developer settings → Personal access tokens
   - `gist` + `read:user` + **`repo`**(private 레포 커밋 시간 포함) 스코프 체크 후 생성
   - 생성된 토큰을 복사

3. **이 레포지토리 Secrets 등록**
   - 이 레포지토리 → Settings → Secrets and variables → Actions
   - `GH_TOKEN` : 위에서 생성한 토큰
   - `GIST_ID` : 위에서 생성한 Gist ID

4. **`.github/workflows/productive-box.yml` 파일 확인**
   - 이미 생성되어 있으니 Actions 탭에서 워크플로우를 수동으로 한 번 실행
   - 이후 매일 자정(UTC)에 자동 업데이트됨

5. **Gist를 프로필에 고정**
   - GitHub 프로필 페이지 → Customize your pins → 해당 Gist 고정

### 기여 스네이크 설정

- `.github/workflows/snake.yml` 워크플로우가 매일 자동으로 SVG를 생성합니다
- 처음 한 번은 Actions 탭에서 수동으로 실행해주세요

</details>
