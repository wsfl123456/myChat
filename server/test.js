const express = require("express");
const app = express();
var http = require("http").createServer(app);
var path = require("path"); //系统路径模块

/* 启动服务 */
http.listen(4000, function () {
  console.log("listening on *:4000");
});


/* 监听socket链接 */

app.use((req, res, next) => {
  next();
});

app.use("/assets", express.static(path.join(__dirname, "./linguaskill/assets")));


app.get('/', (req, res) => {
  res.sendFile( __dirname + '/linguaskill/index.html')
})