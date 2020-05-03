const app = require('./servers.js').app;
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const public = path.join(__dirname, "../public");

app.get('/', (req, res) => {
    res.sendFile(path.join(public, "index.html"));
});

app.get('/create', (req, res) => {
    res.sendFile("create.html", { root: path.join(public) });
});

app.post('/create', (req, res) => {
    // const roomId = uuidv4();
    const redirectUrl = `/lecture/${uuidv4()}`;
    res.status(200);
    res.send({ redirectUrl });
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
    res.status(404).redirect('/');
});
