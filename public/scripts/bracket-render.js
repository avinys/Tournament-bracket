function generateBracket(sections, results = null) {
  console.log("Sections in generateBracket: ", sections);

  const table = document.getElementById("bracket");
  const headerRow = document.getElementById("round-header");
  const tbody = table.querySelector("tbody");

  // Clear the header row and table body
  headerRow.innerHTML = ""; // Clear column headers
  tbody.innerHTML = ""; // Clear all rows

  // Dynamically generate headers
  sections.forEach((_, roundIndex) => {
    const th = document.createElement("th");
    th.textContent = `Round ${roundIndex}`;
    headerRow.appendChild(th);
  });

  // Calculate maximum number of rows
  const maxRows = sections[0].length;
  let isBottomUp;
  let trIndex;

  let pairs = pairUpParticipants(sections);

  //console.log("Pairs: ", pairs);
  // Use the generated pairings to determin rowSpan and rowIndex for every element
  for (let i = 0; i < sections.length; i++) {
    isBottomUp = i === 0 ? false : i % 2 == 0;
    let trIndexPlaceholder = 0;

    // For calculating trIndex for BottomUp approach
    if (isBottomUp) {
      let gap = 0;
      for (let a = 0; a < pairs[i].length - sections[i].length; a++)
        gap += pairs[i][a].length;
      trIndexPlaceholder = gap;
    }

    for (let j = 0; j < sections[i].length; j++) {
      if (!isBottomUp) rowSpanSize = pairs[i][j].length;
      else {
        let pairIndex = pairs[i].length - sections[i].length + j;
        rowSpanSize = pairs[i][pairIndex].length;
      }

      // For calculating trIndex for BottomUp approach
      let gap = 0;
      for (let a = 0; a < pairs[i].length - sections[i].length; a++)
        gap += pairs[i][a].length;

      trIndex = trIndexPlaceholder;
      trIndexPlaceholder += rowSpanSize;

      console.log(
        "Elementas ",
        sections[i][j],
        " trIndex: ",
        trIndex,
        " i: ",
        i,
        "j: ",
        j,
        " rowSpanSize: ",
        rowSpanSize
      );

      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.setAttribute("rowspan", rowSpanSize);
      const div = document.createElement("div");
      div.textContent = sections[i][j];
      td.appendChild(div);
      if (i == 0) {
        tr.appendChild(td);
        tbody.appendChild(tr);
      } else {
        tbody.children[trIndex].appendChild(td);
      }
    }
  }

  // Additional check if round winner is determined and should be displayed
  if(results != null && results[0] != "") {
    const td = document.createElement("td");
    td.textContent = results[0];
    td.setAttribute("rowspan", maxRows);
    tbody.children[0].appendChild(td)
  }
}

function pairUpParticipants(sections) {
  let pairs = [];

  // Push a copy of the first section array without splitting strings
  pairs.push(sections[0].map((item) => [1])); // Ensure strings remain intact

  for (let i = 0; i < sections.length; i++) {
    participantsInRound =
      Math.floor(sections[i].length / 2) + (sections[i].length % 2);

    pairs.push([]);

    for (let j = 0; j < sections[i].length; j++) {
      isBottomUp = i % 2 === 1;

      console.log("Iteracija: i: ", i, ", j: ", j);

      if (!isBottomUp) {
        if (j % 2 == 0) {
          let t = [];
          t.push(...pairs[i][j]); // Push directly without spreading
          pairs[i + 1].push(t);
        } else {
          pairs[i + 1][pairs[i + 1].length - 1].push(...pairs[i][j]);
        }
      } else {
        if (j % 2 == 0) {
          let t = [];
          t.unshift(...pairs[i][pairs[i].length - j - 1]); // Push directly
          pairs[i + 1].unshift(t);
        } else {
          pairs[i + 1][0].push(...pairs[i][pairs[i].length - j - 1]);
        }
      }
    }
    console.log("Pairs: ", pairs);
  }
  return pairs;
}

function generateLowerBracket(losers, results = null) {
  const table = document.getElementById("lower-bracket");
  const tbody = table.querySelector("tbody");

  tbody.innerHTML = "";

  let colCount;
  let rowCount;

  if (losers.length % 2 == 0) {
    colCount = Math.floor(losers.length / 2);
    rowCount = colCount + 1;
  } else {
    colCount = Math.ceil(losers.length / 2);
    rowCount = colCount;
  }

  console.log("Generate lower bracket: losers: ", losers);
  console.log(
    "Generate lower bracket: colCount: ",
    colCount,
    ", rowCount: ",
    rowCount
  );

  // Generate table of needed size
  for (let i = 0; i < rowCount; i++) {
    const tr = document.createElement("tr");
    for (let a = 0; a < colCount; a++) {
      const td = document.createElement("td");
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  let curRowIndex = 0;
  let curColIndex = 0;

  // Fill the generated table
  for (let i = 0; i < losers.length; i++) {
    const row = tbody.children[curRowIndex];
    const cell = row.children[curColIndex];

    cell.textContent = losers[i];
    cell.classList.add("active");
    console.log(
      "Elementas: ",
      losers[i],
      ", rowIndex: ",
      curRowIndex,
      ", curColIndex: ",
      curColIndex,
      ", i: ",
      i
    );

    if (i % 2 == 0) curRowIndex += 1;
    else curColIndex += 1;
  }

  // Additional check if 3rd place is determined and should be displayed
  if(results != null && results[2] != "") {
    const row = tbody.children[tbody.children.length - 1];
    const td = document.createElement("td");
    td.textContent = results[2];
    td.classList.add("active"); 
    row.appendChild(td)

  }
}
