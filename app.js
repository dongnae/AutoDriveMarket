const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

const mariadb = require("mariadb");
const pool = mariadb.createPool({
	host: '39.122.72.218',
	user: 'root',
	password: 'rulerplane',
	connectionLimit: 3,
	port: 8091
});

global.__conn = null;

pool.getConnection().then(async (conn) => {
	await conn.query("use contest");
	global.__conn = conn;
})

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
	res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
	next();
})

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

global.__queue = [];

const apiRouter = require("./routes/apiRouter");

app.use('/api/', apiRouter);

app.get('/', (req, res) => {
	res.end('test');
});

app.use((req, res) => {
	res.status(404).end('404');
});

app.listen(80, () => console.log('Server running on port 80.'));
