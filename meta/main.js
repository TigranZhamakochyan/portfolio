import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';
let xScale;
let yScale;
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
    })
    .sort((a, b) => a.datetime - b.datetime);
}


function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-tooltip-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;

  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });

  time.textContent = commit.datetime?.toLocaleString('en', {
    timeStyle: 'short',
  });

  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}




function renderCommitInfo(data, commits) {
  d3.select('#stats').selectAll('*').remove();
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


function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type,
  );

  // Display language breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}


function brushed(event) {
  const selection = event.selection;

  d3.selectAll('circle').classed('selected', (d) =>
    isCommitSelected(selection, d),
  );

  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}



function isCommitSelected(selection, commit) {
  if (!selection) {
    return false;
  }

  const [x0, x1] = selection.map((d) => d[0]);
  const [y0, y1] = selection.map((d) => d[1]);

  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);

  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}



function createBrushSelector(svg) {
  // Create brush and listen for events
  svg.call(d3.brush().on('start brush end', brushed));

  // Keep dots above the brush overlay
  svg.selectAll('.dots, .overlay ~ *').raise();
}


function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([height, 0]);

  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .attr('class', 'x-axis')
    .call(xAxis);

  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .attr('class', 'y-axis')
    .call(yAxis);

  // Calculate the minimum and maximum lines per commit
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

  // Create square root radius scale
  const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([7, 18]);

  // Sort commits by total lines in descending order
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  // Draw the dots
  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .style('--r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

  createBrushSelector(svg);
}

function updateScatterPlot(data, commits) {
  const svg = d3.select('#chart').select('svg');

  xScale = xScale.domain(d3.extent(commits, (d) => d.datetime));

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([7, 18]);

  // Redraw the x-axis in place
  const xAxis = d3.axisBottom(xScale);
  const xAxisGroup = svg.select('g.x-axis');
  xAxisGroup.selectAll('*').remove();
  xAxisGroup.call(xAxis);

  const dots = svg.select('g.dots');

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .style('--r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });
}

// Maps technology (line type) to a color; shared across updates so colors stay stable
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function updateFileDisplay(filteredCommits) {
  const lines = filteredCommits.flatMap((d) => d.lines);
  const files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => b.lines.length - a.lines.length);

  const filesContainer = d3
    .select('#files')
    .selectAll('div')
    .data(files, (d) => d.name)
    .join(
      // Only runs when a file's div is first created
      (enter) =>
        enter.append('div').call((div) => {
          div.append('dt');
          div.append('dd');
        }),
    );

  // Runs for every file on each update
  filesContainer
    .select('dt')
    .html((d) => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);

  // One dot per line of code
  filesContainer
    .select('dd')
    .selectAll('div')
    .data((d) => d.lines)
    .join('div')
    .attr('class', 'loc')
    .attr('style', (d) => `--color: ${colors(d.type)}`);
}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

// Filtering state: updated as the reader scrolls through the story
let commitMaxTime = d3.max(commits, (d) => d.datetime);
let filteredCommits = commits;

function updateForTime(maxTime) {
  commitMaxTime = maxTime;
  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  const filteredData = filteredCommits.flatMap((d) => d.lines);

  updateScatterPlot(data, filteredCommits);
  renderCommitInfo(filteredData, filteredCommits);
  updateFileDisplay(filteredCommits);
}

updateForTime(commitMaxTime);

// Scrollytelling: one narrative step per commit
function commitStepHtml(d, i) {
  const fileCount = d3.rollups(
    d.lines,
    (D) => D.length,
    (d) => d.file,
  ).length;

  return `
    On ${d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    })},
    I made <a href="${d.url}" target="_blank">${
      i > 0 ? 'another commit' : 'my first commit, and it was great'
    }</a>.
    I edited ${d.totalLines} lines across ${fileCount} files.
    Then I looked over all I had made, and I saw that it was very good.
  `;
}

for (const storyId of ['#scatter-story', '#files-story']) {
  d3.select(storyId)
    .selectAll('.step')
    .data(commits)
    .join('div')
    .attr('class', 'step')
    .html(commitStepHtml);
}

function onStepEnter(response) {
  updateForTime(response.element.__data__.datetime);
}

for (const scrollyId of ['#scrolly-1', '#scrolly-2']) {
  scrollama()
    .setup({
      container: scrollyId,
      step: `${scrollyId} .step`,
    })
    .onStepEnter(onStepEnter);
}
