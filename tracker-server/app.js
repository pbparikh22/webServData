const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

let credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
let connection = mysql.createConnection(credentials);
connection.connect();

function rowToObject(row) {
	return {
		id: row.id,
	 	year: row.year,
		month: row.month, 
		day: row.day,
		goal: row.goal,
		curweight: row.curweight,
		message: row.message,
	};
}

app.get('/track/:month/:day', (request, response) => {
	const query = 'SELECT year, month, day,goal,  curweight, message, id FROM memory WHERE is_deleted = 0 AND month = ? AND day = ? ORDER BY year DESC, updated_at DESC';
	const params = [request.params.month, request.params.day];
	connection.query(query, params, (error, rows) => {
		response.send({
			ok: true,
			memories: rows.map(rowToObject),
		});
	});
});

app.post('/track', (request, response) => {
        const query = 'INSERT INTO memory(year, month, day, goal, curweight, message) VALUES (?, ?, ?, ?, ?, ?)';
        const params = [request.body.year, request.body.month, request.body.day, request.body.goal, request.body.curweight, request.body.message];
        connection.query(query, params, (error, result) => {
                response.send({
			ok: true,
                        id: result.insertId,
                });
        });
});


app.patch('/track/:id', (request, response) => {
        const query = 'UPDATE memory SET year = ?, month = ?, day = ?, goal = ?, curweight = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        const params = [request.body.year, request.body.month, request.body.day, request.body.goal, request.body.curweight, request.body.message, request.params.id];
        connection.query(query, params, (error, result) => {
                response.send({
                        ok: true,
        
                });
        });
});


app.delete('/track/:id', (request, response) => {
        const query = 'UPDATE memory SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        const params = [request.params.id];
        connection.query(query, params, (error, result) => {
                response.send({
                        ok: true,

                });
        });
});


const port = 9000;
app.listen(port, () => {
    console.log(`We're live on ${port}`);
});
