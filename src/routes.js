const app = require('./servers.js').app;
const path = require("path");
const public = path.join(__dirname, "../public");

app.get('/', (req, res) => {
    res.sendFile(path.join(public, "index.html"));
});

app.get('/create', (req, res) => {
    res.sendFile("create.html", { root: path.join(public) });
});

app.get('/lecture/:id', (req, res) => {
    /** 
     * Make redirect based on id.
     * Make call to redis to destinguish 
     * guests and manager.
     */
    const is_guest = false;
    res.sendFile(!is_guest ?
        "whiteboard.html" : "lecture.html",
        { root: public });
});

app.get('*', function (req, res) {
    res.status(404).sendFile('404.html', { root: public });
});
