// frontend/js/BatterVsBowler.js
import { createSeasonsDropdown } from "./seasonsDropdown.js";

export function drawBatterVsBowlerTable(containerSelector,
    apiEndpoint = "/api/batter_vs_bowler") {
  const container = d3.select(containerSelector);
  container.html("");

  // 1) Title and controls
  container.append("h2")
    .text("Batter vs Bowler Stats")
    .style("margin-bottom", "10px");

  const ctrl = container.append("div")
    .attr("class", "controls")
    .style("display", "flex")
    .style("gap", "10px")
    .style("align-items", "center");

  ctrl.append("label").text("Batter:");
  const batterInput = ctrl.append("input")
    .attr("type", "text")
    .attr("placeholder", "e.g. Virat Kohli")
    .property("value", "Virat Kohli");

  ctrl.append("label").text("Bowler:");
  const bowlerInput = ctrl.append("input")
    .attr("type", "text")
    .attr("placeholder", "e.g. Jasprit Bumrah")
    .property("value", "Jasprit Bumrah");

  const seasonsHelper = createSeasonsDropdown(ctrl);

  const btn = ctrl.append("button")
    .text("Show");

  // 2) Results area
  const resultArea = container.append("div")
    .attr("class", "chart-area")
    .style("margin-top", "20px");

  // 3) Fetch & render table
  btn.on("click", async () => {
    const batter = batterInput.property("value").trim();
    const bowler  = bowlerInput.property("value").trim();
    const selectedYears = seasonsHelper.getSelectedSeasons();
    const yearsParam = selectedYears.includes("all")
      ? "all"
      : selectedYears.join(",");

    if (!batter || !bowler) {
      resultArea.html("<p>Please enter both names.</p>");
      return;
    }
    resultArea.html("<p>Loading…</p>");

    try {
      const url = `${apiEndpoint}` +
                  `?playerA=${encodeURIComponent(batter)}` +
                  `&playerB=${encodeURIComponent(bowler)}` +
                  `&years=${encodeURIComponent(yearsParam)}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.error) {
        resultArea.html(`<p style="color:red">${data.error}</p>`);
      } else {
        renderTable(data);
      }
    } catch (err) {
      console.error(err);
      resultArea.html("<p>Request failed; see console.</p>");
    }
  })
  // immediately trigger for defaults
  .dispatch("click");

  // 4) Table renderer
  function renderTable(d) {
    resultArea.html("");

    // summary heading
    resultArea.append("h3")
      .text(`${d.batter} vs ${d.bowler}`)
      .style("margin-bottom", "10px");

    // build table
    const table = resultArea.append("table")
      .attr("class", "stats-table");

    // header row
    const thead = table.append("thead");
    const headerRow = thead.append("tr");
    ["Metric", "Value"].forEach(h =>
      headerRow.append("th")
        .text(h)
        .style("padding", "6px 8px")
        .style("text-align", "left")
        .style("border-bottom", "2px solid #ccc")
    );

    // body
    const tbody = table.append("tbody");
    const rows = [
      ["Balls Faced", d.balls_faced],
      ["Runs Scored", d.runs_scored],
      ["Strike Rate", d.strike_rate],
      ["Times Out",   d.times_out]
    ];
    rows.forEach(([label, val]) => {
      const tr = tbody.append("tr");
      tr.append("td")
        .text(label)
        .style("padding", "6px 8px")
        .style("border-bottom", "1px solid #eee");
      tr.append("td")
        .text(val != null ? val : "—")
        .style("padding", "6px 8px")
        .style("border-bottom", "1px solid #eee");
    });
  }
}
