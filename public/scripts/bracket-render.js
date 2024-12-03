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
    for (let j = 0; j < sections[i].length; j++) {
      rowSpanSize = pairs[i][j].length;

      trIndex = trIndexPlaceholder;
      trIndexPlaceholder += rowSpanSize;

      // console.log("Elementas ", sections[i][j], " trIndex: ", trIndex, " i: ", i, "j: ", j, " rowSpanSize: ", rowSpanSize)

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
}

function pairUpParticipants(sections) {
  let pairs = [];

  pairs.push([...sections[0]]);

  for (let i = 0; i < sections.length; i++) {
    participantsInRound =
      Math.floor(sections[i].length / 2) + (sections[i].length % 2);

    pairs.push([]);

    for (let j = 0; j < sections[i].length; j++) {
      isBottomUp = i % 2 === 1;

      if (!isBottomUp) {
        if (j % 2 == 0) {
          let t = [];
          t.push(...pairs[i][j]);
          pairs[i + 1].push(t);
        } else {
          pairs[i + 1][pairs[i + 1].length - 1].push(...pairs[i][j]);
        }
      } else {
        if (j % 2 == 0) {
          let t = [];
          t.unshift(...pairs[i][pairs[i].length - j - 1]);
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

function generateLowerBracket(losers) {
  const table = document.getElementById("lower-bracket");
  const tbody = table.querySelector("tbody");

  tbody.innerHTML = "";

  let colCount;
  let rowCount;

  if (losers.length % 2 == 0) {
    colCount = Math.floor(losers.length / 2);
    rowCount = colCount + 1
  } else {
    colCount = Math.ceil(losers.length / 2);
    rowCount = colCount;
  }

  console.log("Generate lower bracket: losers: ", losers);
  console.log("Generate lower bracket: colCount: ", colCount, ", rowCount: ", rowCount)

  // Generate table of needed size
  for(let i = 0; i < rowCount; i++) {
    const tr = document.createElement("tr");
    for(let a = 0; a < colCount; a++) {
      const td = document.createElement("td");
      tr.appendChild(td)
    }
    tbody.appendChild(tr)
  }

  let curRowIndex = 0;
  let curColIndex = 0;

  // Fill the generated table
  for (let i = 0; i < losers.length; i++) {
    const row = tbody.children[curRowIndex];
    const cell = row.children[curColIndex];

    cell.textContent = losers[i];
    cell.classList.add("active")
    console.log("Elementas: ",losers[i], ", rowIndex: ", curRowIndex, ", curColIndex: ", curColIndex, ", i: ", i);

    if (i % 2 == 0)
      curRowIndex += 1;
    else
      curColIndex += 1
  }
}