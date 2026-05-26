import fs from "node:fs";
import { execSync } from "node:child_process";

const token = process.env.GH_TOKEN;
const reposRaw = process.env.TRACK_REPOS ?? "";
const localReposRaw = process.env.LOCAL_GIT_REPOS ?? "";
const days = Number.parseInt(process.env.DAYS ?? "365", 10);
const tz = process.env.TIMEZONE ?? "Asia/Seoul";
const readmePath = process.env.README_PATH ?? "README.md";
const grassPath = process.env.GRASS_PATH ?? "assets/work-grass.svg";

const START_SUMMARY = "<!--START_SECTION:activity-summary-->";
const END_SUMMARY = "<!--END_SECTION:activity-summary-->";
const START_COMMITS = "<!--START_SECTION:recent-commits-->";
const END_COMMITS = "<!--END_SECTION:recent-commits-->";

const repos = reposRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const localRepos = localReposRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!token && repos.length === 0 && localRepos.length === 0) {
  console.error("Set GH_TOKEN+TRACK_REPOS or LOCAL_GIT_REPOS.");
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

function fetchLocalCommits(repoPath) {
  const sinceIso = since.toISOString();
  const out = execSync(`git -C "${repoPath}" log --since="${sinceIso}" --format=%aI`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((iso) => ({ commit: { author: { date: iso } } }));
}

function dateKey(iso) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function levelColor(count) {
  if (count <= 0) return "#161b22";
  if (count <= 2) return "#0e4429";
  if (count <= 5) return "#006d32";
  if (count <= 9) return "#26a641";
  return "#39d353";
}

function buildGrassSvg(byDate) {
  const cell = 12;
  const gap = 3;
  const pad = 16;
  const weeks = 53;

  const end = new Date();
  const endKst = new Date(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(end),
  );

  const start = new Date(endKst);
  start.setDate(start.getDate() - (weeks * 7 - 1));

  const grid = [];
  let cursor = new Date(start);
  while (cursor <= endKst) {
    const key = dateKey(cursor.toISOString());
    grid.push({ date: new Date(cursor), key, count: byDate.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  while (grid.length % 7 !== 0) grid.push(null);

  const cols = grid.length / 7;
  const width = pad * 2 + cols * cell + (cols - 1) * gap;
  const height = pad * 2 + 7 * cell + 6 * gap;

  let rects = "";
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < 7; r++) {
      const item = grid[c * 7 + r];
      if (!item) continue;
      const x = pad + c * (cell + gap);
      const y = pad + r * (cell + gap);
      rects += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${levelColor(item.count)}" data-date="${item.key}" data-count="${item.count}"/>`;
    }
  }

  const total = [...byDate.values()].reduce((a, b) => a + b, 0);
  const activeDays = [...byDate.values()].filter((n) => n > 0).length;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Work contribution calendar, ${total} commits">
  <rect width="100%" height="100%" fill="#0d1117"/>
  ${rects}
  <text x="${pad}" y="${height - 4}" fill="#8b949e" font-family="Segoe UI, sans-serif" font-size="11">${total} commits · ${activeDays} active days · ${tz}</text>
</svg>`;
}

function rollupRows(byDate) {
  const rolled = new Map();
  for (const [key, count] of byDate) {
    const bucket = key.slice(0, 7);
    rolled.set(bucket, (rolled.get(bucket) ?? 0) + count);
  }
  return [...rolled.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function replaceBetween(readme, start, end, body) {
  const startIdx = readme.indexOf(start);
  const endIdx = readme.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Markers not found: ${start}`);
  }
  return `${readme.slice(0, startIdx + start.length)}\n${body}\n${readme.slice(endIdx)}`;
}

function buildSummarySection(grandTotal, repoStats, updatedAt) {
  const periodLabel = days >= 365 ? "최근 1년" : `최근 ${days}일`;
  const repoCount = repoStats.length;

  return `
<table>
  <tr>
    <td align="center"><strong style="font-size:1.4em">${grandTotal}</strong><br/><sub>commits</sub></td>
    <td align="center"><strong style="font-size:1.4em">${repoCount}</strong><br/><sub>repos</sub></td>
    <td align="center"><strong style="font-size:1.1em">${periodLabel}</strong><br/><sub>${tz}</sub></td>
  </tr>
</table>

<sub>마지막 갱신 · ${updatedAt}</sub>
`.trim();
}

function buildCommitsSection(repoStats) {
  const grandTotal = repoStats.reduce((sum, r) => sum + r.total, 0);

  let md = "| 레포 | 커밋 |\n|:------|-----:|\n";
  for (const r of repoStats) {
    md += `| \`${r.shortName}\` | **${r.total}** |\n`;
  }
  md += `| **합계** | **${grandTotal}** |\n\n`;

  const months = new Set();
  for (const r of repoStats) {
    for (const [m] of r.rows) months.add(m);
  }
  const monthList = [...months].sort();

  if (monthList.length > 0) {
    md += "| 월 |";
    for (const r of repoStats) md += ` ${r.shortName} |`;
    md += " 합계 |\n|----|";
    for (const _r of repoStats) md += "------:|";
    md += "------:|\n";

    for (const m of monthList) {
      let rowSum = 0;
      md += `| **${m}** |`;
      for (const r of repoStats) {
        const found = r.rows.find(([month]) => month === m);
        const n = found ? found[1] : 0;
        rowSum += n;
        md += ` ${n} |`;
      }
      md += ` **${rowSum}** |\n`;
    }
  }

  return md.trimEnd();
}

const repoStats = [];
const mergedByDate = new Map();

if (token && repos.length > 0) {
  for (const fullName of repos) {
    const [owner, repo] = fullName.split("/");
    const commits = await fetchAllCommits(owner, repo);
    const byDate = new Map();
    for (const c of commits) {
      const iso = c.commit?.author?.date ?? c.commit?.committer?.date;
      if (!iso) continue;
      const key = dateKey(iso);
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
      mergedByDate.set(key, (mergedByDate.get(key) ?? 0) + 1);
    }
    repoStats.push({ shortName: repo, total: commits.length, rows: rollupRows(byDate) });
  }
} else {
  for (const repoPath of localRepos) {
    const name = repoPath.split(/[/\\]/).pop();
    const commits = fetchLocalCommits(repoPath);
    const byDate = new Map();
    for (const c of commits) {
      const iso = c.commit.author.date;
      const key = dateKey(iso);
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
      mergedByDate.set(key, (mergedByDate.get(key) ?? 0) + 1);
    }
    repoStats.push({ shortName: name, total: commits.length, rows: rollupRows(byDate) });
  }
}

const updatedAt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: tz,
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date());

const grandTotal = repoStats.reduce((s, r) => s + r.total, 0);

fs.mkdirSync("assets", { recursive: true });
fs.writeFileSync(grassPath, buildGrassSvg(mergedByDate), "utf8");
fs.writeFileSync("assets/meta.json", JSON.stringify({ total: grandTotal }), "utf8");

let readme = fs.readFileSync(readmePath, "utf8");
readme = replaceBetween(readme, START_SUMMARY, END_SUMMARY, buildSummarySection(grandTotal, repoStats, updatedAt));
readme = replaceBetween(readme, START_COMMITS, END_COMMITS, buildCommitsSection(repoStats));
fs.writeFileSync(readmePath, readme, "utf8");

console.log(`Wrote ${grassPath} and updated ${readmePath} (${grandTotal} commits)`);
