import fs from "node:fs";

const token = process.env.GH_TOKEN;
const reposRaw = process.env.TRACK_REPOS ?? "";
const days = Number.parseInt(process.env.DAYS ?? "30", 10);
const tz = process.env.TIMEZONE ?? "Asia/Seoul";
const readmePath = process.env.README_PATH ?? "README.md";

const START = "<!--START_SECTION:recent-commits-->";
const END = "<!--END_SECTION:recent-commits-->";

if (!token) {
  console.error("GH_TOKEN is required.");
  process.exit(1);
}

const repos = reposRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (repos.length === 0) {
  console.error("TRACK_REPOS is empty. Set repository variable TRACK_REPOS (e.g. org/audit-log-manager,org/audit-log-server).");
  process.exit(1);
}

const since = new Date();
since.setUTCDate(since.getUTCDate() - days);

async function fetchAllCommits(owner, repo) {
  const commits = [];
  let page = 1;

  while (true) {
    const url = new URL(`https://api.github.com/repos/${owner}/${repo}/commits`);
    url.searchParams.set("since", since.toISOString());
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (res.status === 404) {
      throw new Error(`Repository not found or no access: ${owner}/${repo}`);
    }
    if (!res.ok) {
      throw new Error(`${owner}/${repo}: HTTP ${res.status} ${await res.text()}`);
    }

    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    commits.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return commits;
}

function dateKey(iso) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function buildSection(repoStats) {
  const grandTotal = repoStats.reduce((sum, r) => sum + r.total, 0);
  const updatedAt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: tz,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  let md = "";
  md += `_집계: 최근 ${days}일 · ${tz} 기준 날짜 · 작성자 무관 · 마지막 갱신: ${updatedAt}_\n\n";
  md += "| 프로젝트 | 기간 내 커밋 |\n|----------|-------------:|\n";
  for (const r of repoStats) {
    md += `| **${r.shortName}** | ${r.total} |\n`;
  }
  md += `| **합계** | **${grandTotal}** |\n\n`;

  for (const r of repoStats) {
    md += `### ${r.shortName}\n\n`;
    if (r.rows.length === 0) {
      md += `_해당 기간 커밋 없음_\n\n";
      continue;
    }
    md += "| 날짜 | 커밋 수 |\n|------|--------:|\n";
    for (const [date, count] of r.rows) {
      md += `| ${date} | ${count} |\n`;
    }
    md += "\n";
  }

  return md.trimEnd();
}

function replaceSection(readme, sectionBody) {
  const startIdx = readme.indexOf(START);
  const endIdx = readme.indexOf(END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`README markers not found: ${START} / ${END}`);
  }

  const before = readme.slice(0, startIdx + START.length);
  const after = readme.slice(endIdx);
  return `${before}\n${sectionBody}\n${after}`;
}

const repoStats = [];

for (const fullName of repos) {
  const [owner, repo] = fullName.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid TRACK_REPOS entry: ${fullName} (use owner/repo)`);
  }

  const commits = await fetchAllCommits(owner, repo);
  const byDate = new Map();

  for (const c of commits) {
    const iso = c.commit?.author?.date ?? c.commit?.committer?.date;
    if (!iso) continue;
    const key = dateKey(iso);
    byDate.set(key, (byDate.get(key) ?? 0) + 1);
  }

  const rows = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
  repoStats.push({
    shortName: repo,
    total: commits.length,
    rows,
  });
}

const section = buildSection(repoStats);
const readme = fs.readFileSync(readmePath, "utf8");
const next = replaceSection(readme, section);
fs.writeFileSync(readmePath, next, "utf8");

console.log(`Updated ${readmePath} for repos: ${repos.join(", ")}`);
