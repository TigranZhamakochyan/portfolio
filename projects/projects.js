
import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


const projects = await fetchJSON('../lib/projects.json');
let query = '';
let selectedIndex = -1;
let selectedYear = null;

const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;


function renderPieChart(projectsGiven) {

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  arcs.forEach((arc, idx) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .on('click', () => {
        let clickedYear = data[idx].label;

        selectedYear = selectedYear === clickedYear ? null : clickedYear;
        selectedIndex = selectedYear === null ? -1 : idx;

        svg
          .selectAll('path')
          .attr('class', (_, i) => (
            i === selectedIndex ? 'selected' : ''
          ));

        d3.select('.legend')
          .selectAll('li')
          .attr('class', (_, i) => (
            i === selectedIndex ? 'legend-item selected' : 'legend-item'
          ));

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

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });

  selectedIndex = data.findIndex((d) => d.label === selectedYear);

  svg
    .selectAll('path')
    .attr('class', (_, i) => (
      i === selectedIndex ? 'selected' : ''
    ));

  legend
    .selectAll('li')
    .attr('class', (_, i) => (
      i === selectedIndex ? 'legend-item selected' : 'legend-item'
    ));

} 


renderPieChart(projects);


let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  let visibleProjects = filteredProjects;

  if (selectedYear !== null) {
    visibleProjects = filteredProjects.filter((project) =>
      project.year === selectedYear
    );
  }

  renderProjects(visibleProjects, projectsContainer, 'h2');

  renderPieChart(filteredProjects);
});
