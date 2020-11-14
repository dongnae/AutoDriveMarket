const express = require("express");
const crypto = require("crypto");
let router = express.Router();

const sha1 = str => crypto.createHash('sha1').update(str).digest().toString('hex');

router.use((req, res, next) => {
	res.header('Content-Type', 'application/json');
	next();
});

router.get('/buy/', async (req, res) => {
	//console.log(req.query.buy);
	let list = JSON.parse(req.query.buy);
	//console.log(list, req.body);
	if (!Array.isArray(list)) {
		res.status(400).end(JSON.stringify({
			status: 1
		}));
		return;
	}
	if (list.filter(obj => typeof obj.name === "string" && typeof obj.price === "string" && typeof obj.cnt === "string").length) {
		res.status(400).end(JSON.stringify({
			status: 2
		}));
		return;
	}

	let id = sha1(String(JSON.stringify(list) + "|" + Date.now()));
	await __conn.query(`INSERT into buy values(?, ?, 0)`, [id, JSON.stringify(list)]);
	//__queue.push({list: list, id: id, status: 0});
	//console.log(require("util").inspect(__queue, true, null, true));
	res.status(200).end(JSON.stringify({
		status: 0,
		result: id
	}));
});

router.get("/update", async (req, res) => {
	console.log(req.query);
	let id = req.query.id;
	//console.log(list, req.body);
	if (id === undefined) {
		res.status(200).end(JSON.stringify({
			status: 1
		}));
		return;
	}

	let ret = await __conn.query("select status from buy where id = ?", [id]);
	delete ret.meta;

	if (!Object.values(ret).length) {
		ret.status(200).end(JSON.stringify({
			status: 2
		}));
		return;
	}

	++ret[0].status;

	await __conn.query("update buy set status = ? where id = ?", [ret[0].status, id]);

	res.status(200).end(JSON.stringify({
		status: 0,
		result: ret[0].status
	}));
});

/*
router.post("/status/", (req, res) => {
	let id = req.body.id;
	console.log(req.body);
	if (typeof id !== "string") {
		res.status(400).end(JSON.stringify({
			status: 1
		}));
		return;
	}

	console.log("ID", id);

	let num = -1;
	for (let i = 0; i < __queue.length; i++)
		if (__queue[i].id === id) {
			num = i;
		}

	console.log("num", num, id);

	if (num < 0) { //대기열에 없는 경우
		res.status(200).end(JSON.stringify({
			status: 2,
			msg: "완료된 주문이거나 주문한 적이 없습니다."
		}));
		return;
	}

	res.status(200).end(JSON.stringify({
		status: 0,
		result: __queue[num].list
	}));
});
*/
router.get('/list/', async (req, res) => {
	if (__conn === null) {
		res.status(200).end(JSON.stringify({
			status: 1
		}));
		return;
	}

	let ret = await __conn.query("SELECT * from buy");
	delete ret.meta;
	res.status(200).end(JSON.stringify({
		status: 0,
		result: ret
	}));
});

router.use((req, res) => {
	res.status(400).end(JSON.stringify({
		status: 999
	}));
});

module.exports = router;
