import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));


  return data;
}


function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: 'https://github.com/TigranZhamakochyan/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: false,
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Total lines of code
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Total files
  const totalFiles = d3.group(data, (d) => d.file).size;

  dl.append('dt').text('Files');
  dl.append('dd').text(totalFiles);

  // Maximum depth
  const maxDepth = d3.max(data, (d) => d.depth);

  dl.append('dt').text('Max Depth');
  dl.append('dd').text(maxDepth);

  // Longest line length
  const longestLine = d3.max(data, (d) => d.length);

  dl.append('dt').text('Longest Line');
  dl.append('dd').text(longestLine);

  // Maximum number of lines in a file
  const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (d) => d.line),
    (d) => d.file,
  );

  const maxLines = d3.max(fileLengths, (d) => d[1]);

  dl.append('dt').text('Max Lines');
  dl.append('dd').text(maxLines);
}

let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits);