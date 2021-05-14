const axios = require("axios");
var mysql = require("mysql");
var sqlConn = null;

const dbUser = "financepoc";
const dbPwd = "financepoc";
const dbEndpoint = "financepoc.cwtfvoedygcp.us-east-1.rds.amazonaws.com";
const dbPort = "3306";
const dbName = "historical";

async function updateStockHistory(ticker, stockDetails) {
  //const query = "select count(*) as cnt from `historical`.`stock_history`";
  //const query = "select count(*) as cnt from `historical`.`stock_history`";
  var sql = "";
  
  if (stockDetails.length) {
    return new Promise((resolve, reject) => {
      sql =
        "INSERT INTO `historical`.`stock_history` (stock_ticker, date, time, open, high, low, close, adj_close, volume) VALUES ? ";
      var values = [];

      stockDetails.forEach((element) => {
        quoteDate = new Date(element.timestamp);
        inserts = [
          ticker,
          element.date,
          element.date,
          element.open,
          element.high,
          element.low,
          element.close,
          element.adjClose,
          element.volume,
        ];

        values.push(inserts);
      });

      console.info("dbHandler:updateStockHistory->Calling SQL " + sql);
      getResult(sql, values, (err, rows) => {
        if (err) {
          reject(err); // calling `reject` will cause the promise to fail with or without the error passed as an argument
          return; // and we don't want to go any further
        } else {
          console.info("dbHandler:updateStockHistory->Rows added " + rows);
          sqlConn.end();
          resolve(rows);
        }
      });
    });
  } else {
    sql =
      "INSERT INTO `historical`.`stock_history` SET stock_ticker = ?, date = ?, time = ?, open = ?, high = ?, low = ?, close = ?, adj_close = ?, volume = ? ";

    quoteDate = new Date(stockDetails.timestamp);
    inserts = [
      stockDetails.symbol,
      quoteDate,
      quoteDate,
      stockDetails.open,
      stockDetails.dayHigh,
      stockDetails.dayLow,
      stockDetails.previousClose,
      0,
      stockDetails.volume,
    ];
    sql = mysql.format(sql, inserts);

    return new Promise((resolve, reject) => {
      getResult(sql, null, (err, rows) => {
        if (err) {
          reject(err); // calling `reject` will cause the promise to fail with or without the error passed as an argument
          if (sqlConn != nul) {
            sqlConn.end();
          }

          return; // and we don't want to go any further
        }
        sqlConn.end();
        resolve(rows);
      });
    });
  }
}

function getDbConnection(callback) {
  if (sqlConn != null) {
    callback(err, sqlConn);
  }

  console.info("dbHandler:getDBConnection->connecting to db ...");
  var connection = mysql.createConnection({
    host: dbEndpoint,
    user: dbUser,
    port: dbPort,
    password: dbPwd,
    database: dbName,
  });

  connection.connect(function (err) {
    console.info("dbHandler:getDBConnection->connect finished " + err);
    sqlConn = connection;
    callback(err, connection);
  });
}

function executeQuery(query, values, callback) {
  //pool.getConnection(function (err, connection) {
  getDbConnection(function (err, connection) {
    if (err) {
      return callback(err, null);
    } else if (connection) {
      connection.query(query, [values], function (err, rows, fields) {
        //connection.release();
        if (err) {
          return callback(err, null);
        }
        return callback(null, rows);
      });
    } else {
      return callback(true, "No Connection");
    }
  });
}

function getResult(query, values, callback) {
  executeQuery(query, values, function (err, rows) {
    if (!err) {
      callback(null, rows);
    } else {
      callback(true, err);
    }
  });
}

module.exports = {
  updateStockHistory,
};
