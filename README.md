<div align="center">

# Tigran Zhamakochyan · Portfolio

**An interactive portfolio at the intersection of data science, web development, and data visualization.**

Built with HTML, CSS, JavaScript, D3.js, and Scrollama.

[![Visit Portfolio](https://img.shields.io/badge/Live%20Portfolio-Visit%20Website-2563EB?style=for-the-badge&logo=githubpages&logoColor=white)](https://tigranzhamakochyan.github.io/portfolio/)
[![GitHub Profile](https://img.shields.io/badge/GitHub-Profile-24292F?style=for-the-badge&logo=github&logoColor=white)](https://github.com/TigranZhamakochyan)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/tigran-zhamakochyan/)

</div>

---

## Overview

This repository contains my personal portfolio website. I'm a **Data Science student at the University of California, San Diego**, interested in machine learning, applied research, and making complex information easier to explore.

Beyond presenting my projects and experience, the site demonstrates hands-on frontend and visualization work: a searchable project gallery, interactive D3.js charts, GitHub API integration, and scroll-driven visualizations of the website's own development history.

**[Explore the live portfolio →](https://tigranzhamakochyan.github.io/portfolio/)**

## Features

| Feature | What it does |
| --- | --- |
| **Project gallery** | Renders projects from a JSON dataset, with case-insensitive search and a D3.js pie chart that groups projects by year. Click a pie slice to filter the gallery. |
| **GitHub profile statistics** | Fetches public profile metrics (followers, following, repositories, and gists) through the GitHub API. |
| **Codebase analytics** | Visualizes the portfolio's commit history with a time-of-day scatterplot, commit tooltips, selection brushing, and a language breakdown. |
| **Scroll-driven data stories** | Uses Scrollama to progressively reveal commits and update both the scatterplot and a file-level unit visualization as the reader scrolls. |
| **Theme preferences** | Offers automatic, light, and dark modes, saving the selected preference in local storage. |
| **Resume and contact** | Includes a dedicated resume page and an email-based contact form. |

### Explore the site

- **[Home](https://tigranzhamakochyan.github.io/portfolio/)** — Introduction, GitHub stats, and latest projects.
- **[Projects](https://tigranzhamakochyan.github.io/portfolio/projects/)** — Searchable projects and an interactive project-by-year chart.
- **[Meta](https://tigranzhamakochyan.github.io/portfolio/meta/)** — Data visualization of the site's development history.
- **[Resume](https://tigranzhamakochyan.github.io/portfolio/resume/)** — Education, research, experience, and technical skills.
- **[Contact](https://tigranzhamakochyan.github.io/portfolio/contact/)** — Email-based contact form.

## Technical Highlights

### Interactive project exploration

Project information is maintained in [`lib/projects.json`](lib/projects.json) and rendered into reusable project cards. The projects page uses **D3.js** to aggregate projects by year and create an interactive pie chart, while text search filters across project fields.

### Git history as data

The **[Meta page](https://tigranzhamakochyan.github.io/portfolio/meta/)** turns repository metadata into an interactive narrative:

1. Loads line-level code history from [`meta/loc.csv`](meta/loc.csv) and groups records into commits.
2. Plots **commit date vs. time of day**, sizing marks according to the number of lines associated with each commit.
3. Supports **brushing**, hover tooltips, and a breakdown of programming languages for selected commits.
4. Connects **Scrollama** steps to D3 updates, revealing the evolution of the repository as the reader scrolls.
5. Displays a **unit visualization** of files, where colored marks represent lines of code by type.

This is the most visualization-focused part of the project, combining data processing, interactive chart design, and narrative storytelling.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript (ES modules) |
| Data visualization | D3.js v7.9 |
| Scrollytelling | Scrollama v3.2 |
| Data | JSON, CSV, GitHub REST API |
| Development | Git, GitHub, `elocuent` (for code-history data generation) |
| Hosting | GitHub Pages |

## Project Structure

```text
portfolio/
├── index.html              # Home page
├── index.js                # Latest projects and GitHub profile stats
├── global.js               # Shared navigation, theme handling, and helpers
├── style.css               # Shared styles and visualization layouts
├── lib/
│   └── projects.json       # Project data
├── projects/
│   ├── index.html          # Projects page
│   └── projects.js         # D3 pie chart, search, filtering
├── meta/
│   ├── index.html          # Meta / code analytics page
│   ├── main.js             # D3 visualizations and Scrollama interactions
│   └── loc.csv             # Line-level code history dataset
├── resume/
│   └── index.html          # Resume page
├── contact/
│   └── index.html          # Contact page
├── images/                 # Site images and project thumbnails
└── package.json            # Development tooling
```

## Run Locally

The site is built with standard browser technologies and **does not require a frontend build step**. Use a local web server so that JavaScript modules and `fetch()` requests can load the JSON and CSV assets correctly.

**1. Clone the repository**

```bash
git clone https://github.com/TigranZhamakochyan/portfolio.git
cd portfolio
```

**2. Start a local server** (Python 3)

```bash
python -m http.server 8000
```

**3. Open** [http://localhost:8000](http://localhost:8000) **in your browser**.

> D3.js and Scrollama are imported from a CDN, and GitHub profile statistics are fetched from the GitHub API. Those features require an internet connection. The Meta visualizations use the checked-in `meta/loc.csv` dataset, which represents a snapshot of the code history rather than automatically syncing with every new commit.

## What I Learned

This project gave me experience with:

- Structuring a multi-page site with reusable JavaScript utilities and data-driven content.
- Turning JSON and CSV data into interactive visualizations with **D3.js**.
- Coordinating state across search, chart selections, tooltips, and scrolling interactions.
- Communicating code history as a **visual story**, rather than a static table of commits.
- Deploying and maintaining a publicly accessible project through **GitHub Pages**.

## Contact

I'm always interested in connecting about **data science, machine learning, and applied research**.

- **Website:** [tigranzhamakochyan.github.io/portfolio](https://tigranzhamakochyan.github.io/portfolio/)
- **LinkedIn:** [tigran-zhamakochyan](https://www.linkedin.com/in/tigran-zhamakochyan/)
- **GitHub:** [TigranZhamakochyan](https://github.com/TigranZhamakochyan)

---

<div align="center">
  <sub>Designed and developed by <a href="https://github.com/TigranZhamakochyan">Tigran Zhamakochyan</a>.</sub>
</div>
