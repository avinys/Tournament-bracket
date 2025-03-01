const groupTableBody = document.querySelector("#group-table tbody")
const sortDropdown = document.getElementById("sort-groups-dropdown")

function renderTable(groupsData) {
    groupTableBody.innerHTML = "";

    groupsData.forEach(group => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${group[3]}</td>
            <td>${group[0]}</td>
            <td>${group[1]}</td>
            <td>${group[2]}</td>
            <td class="actions">
                <a class="btn-table" href="/${group[2]}?date=${group[0]}&group=${group[1]}">View</a>
                <a class="btn-table" href="/data/delete-group?date=${group[0]}&group=${group[1]}">Delete</a>
            </td>
        `;

        groupTableBody.appendChild(row);
    });
}

function sortGroups(criteria) {
    let sortedGroups = [...groups];

    switch (criteria) {
        case "group-name-asc":
            sortedGroups.sort((a, b) => a[3].localeCompare(b[3])); // Group name ascending
            break;
        case "group-name-desc":
            sortedGroups.sort((a, b) => b[3].localeCompare(a[3])); // Group name descending
            break;
        case "date-asc":
            sortedGroups.sort((a, b) => new Date(a[0]) - new Date(b[0])); // Date ascending
            break;
        case "date-desc":
            sortedGroups.sort((a, b) => new Date(b[0]) - new Date(a[0])); // Date descending
            break;
        case "group-number-asc":
            sortedGroups.sort((a, b) => a[1] - b[1]); // Group number ascending
            break;
        case "group-number-desc":
            sortedGroups.sort((a, b) => b[1] - a[1]); // Group number descending
            break;
        case "match-type-asc":
            sortedGroups.sort((a, b) => a[2].localeCompare(b[2])); // Match type ascending
            break;
        case "match-type-desc":
            sortedGroups.sort((a, b) => b[2].localeCompare(a[2])); // Match type descending
            break;
        default:
            sortedGroups = groups; // Reset to original order if default is selected
            break;
    }

    renderTable(sortedGroups);
}


document.addEventListener("DOMContentLoaded", function () {
    renderTable(groups);
    sortDropdown.addEventListener("change", function () {
        sortGroups(sortDropdown.value)
    })
});