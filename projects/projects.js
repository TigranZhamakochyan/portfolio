
import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Fetch project data
const projects = await fetchJSON('../lib/projects.json');
let query = '';
let selectedIndex = -1;
let selectedYear = null;

const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

// Function to render the pie chart
function renderPieChart(projectsGiven) {

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  // Group projects by year
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  // Generate pie slices
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Clear previous slices
  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  // Draw pie chart
  arcs.forEach((arc, idx) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .on('click', () => {
        let clickedYear = data[idx].label;

        selectedYear = selectedYear === clickedYear ? null : clickedYear;
        selectedIndex = selectedYear === null ? -1 : idx;

        // Highlight selected wedge
        svg
          .selectAll('path')
          .attr('class', (_, i) => (
            i === selectedIndex ? 'selected' : ''
          ));

        // Highlight corresponding legend item
        d3.select('.legend')
          .selectAll('li')
          .attr('class', (_, i) => (
            i === selectedIndex ? 'legend-item selected' : 'legend-item'
          ));

        // Filter projects by selected year
        if (selectedYear === null) {
          renderProjects(projectsGiven, projectsContainer, 'h2');
        } else {
          let yearProjects = projectsGiven.filter((project) =>
            project.year === selectedYear
          );

          renderProjects(yearProjects, projectsContainer, 'h2');
        }
      });
  });

  // Select legend and clear previous items
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  // Create updated legend
  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });

  // Find the selected year's current index
  selectedIndex = data.findIndex((d) => d.label === selectedYear);

  // Restore the selected wedge highlight
  svg
    .selectAll('path')
    .attr('class', (_, i) => (
      i === selectedIndex ? 'selected' : ''
    ));

  // Restore the selected legend highlight
  legend
    .selectAll('li')
    .attr('class', (_, i) => (
      i === selectedIndex ? 'legend-item selected' : 'legend-item'
    ));

} // End of renderPieChart()


// Render pie chart when the page first loads
renderPieChart(projects);


// Search functionality
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  // Filter projects by search query
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  // Also filter by selected year
  let visibleProjects = filteredProjects;

  if (selectedYear !== null) {
    visibleProjects = filteredProjects.filter((project) =>
      project.year === selectedYear
    );
  }

  // Update displayed projects
  renderProjects(visibleProjects, projectsContainer, 'h2');

  // Update pie chart based on search results
  renderPieChart(filteredProjects);
});
