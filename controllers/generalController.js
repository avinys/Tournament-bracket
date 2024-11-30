

async function getHome(req, res) {
    res.render("pages/index.ejs")
}

module.exports = {
    getHome: getHome,
}