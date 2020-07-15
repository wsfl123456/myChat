const express = require("express");
const app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

var fs = require("fs"); //文件模块
var path = require("path"); //系统路径模块
var multer = require("multer"); //文件上传

/* 中间件 */
const mysql = require("mysql");
const bodyParser = require("body-parser"); /*post方法*/
const cookieParser = require("cookie-parser");

/* 启动服务 */
http.listen(4000, function () {
  console.log("listening on *:4000");
});

/* 链接mysql */
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Fl888,./", //正式
  // password: "MyNewPass", //本地
  database: "mychats",
});
connection.connect();

/* 监听socket链接 */
const onlineUsersId = {};
io.on("connection", function (socket) {
  var toUserId = {};
  var fromUserId = {};
  socket.on("addUser", function (userId) {
    if (!onlineUsersId.hasOwnProperty(userId)) {
      onlineUsersId[userId] = socket;
    }
    fromUserId = userId;

    socket.on("addFriend", function (toUserId) {
      if (toUserId in onlineUsersId) {
        onlineUsersId[toUserId].emit("addFriendTo" + toUserId, toUserId);
      } else {
        console.log(toUserId + "不在线");
      }
    });

    socket.on("agreeFriend", function (toUserId) {
      if (toUserId in onlineUsersId) {
        onlineUsersId[toUserId].emit("agreeFriendTo" + toUserId, toUserId);
      } else {
        console.log(toUserId + "不在线");
      }
    });

    socket.on("sendMsg", function (obj) {
      /* 发送socket和存入数据库同步进行 */
      toUserId = obj.toUserId;
      if (toUserId in onlineUsersId) {
        onlineUsersId[toUserId].emit("sendMsgTo" + toUserId, obj);
        onlineUsersId[fromUserId].emit("sendMsgTo" + fromUserId, obj);
      } else {
        console.log(toUserId + "不在线");
        onlineUsersId[fromUserId].emit("sendMsgTo" + fromUserId, obj);
      }

      const sql = `INSERT INTO message(showId, msg, time, toUserId, fromUserId) VALUES(${obj.toUserId}, '${obj.msg}', '${obj.time}',${obj.toUserId},${obj.fromUserId}),(${obj.fromUserId}, '${obj.msg}', '${obj.time}', ${obj.toUserId}, ${obj.fromUserId});`;
      connection.query(sql, (error) => {
        if (error) {
          throw error;
        }
        console.log("----------msg新增成功-------------");
      });
    });
    socket.on("disconnect", function () {
      // console.log(fromUserId, "客户端断开连接.");
      //每次都要删除该socket连接 否则断开重连还是这个socket但是client端socket已经改变
      delete onlineUsersId[fromUserId];
      // console.log("当前在线：", Object.keys(onlineUsersId));
    });
    socket.on("mydisconnect", function () {
      socket.disconnect();
    });
  });
});

/* 添加中间件 */
app.use(bodyParser.json()); // 添加json解析
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "./public")));
app.use("/static", express.static(path.join(__dirname, "./dist/static")));

app.use((req, res, next) => {
  next();
});

/* 文件上传 */
const dir = path.resolve(__dirname, "../server/public/static/img");
// 图片大小限制KB
const SIZELIMIT = 500000;

const storage = multer.diskStorage({
  // 指定文件路径
  destination: function (req, file, cb) {
    // ！！！相对路径时以node执行目录为基准，避免权限问题，该目录最好已存在*
    // cb(null, './uploads');
    cb(null, dir);
  },
  // 指定文件名
  filename: function (req, file, cb) {
    // filedname指向参数key值
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
});
app.get('/', (req, res) => {
  res.sendFile( __dirname + '/dist/index.html')
})
app.post("/upload", upload.single("logo"), (req, res) => {
  // 即将上传图片的key值 form-data对象{key: value}
  // 检查是否有文件待上传
  if (req.file === undefined) {
    return res.send({
      errno: -1,
      msg: "no file",
    });
  }
  const { size, mimetype, filename } = req.file;
  const types = ["jpg", "jpeg", "png", "gif"];
  const tmpTypes = mimetype.split("/")[1];
  // 检查文件大小
  if (size >= SIZELIMIT) {
    return res.send({
      errno: -1,
      msg: "file is too large",
    });
  }
  // 检查文件类型
  else if (types.indexOf(tmpTypes) < 0) {
    return res.send({
      errno: -1,
      msg: "not accepted filetype",
    });
  }
  // 路径可根据设置的静态目录指定
  const url = "/public/static/img/" + filename;

  const resParams = {
    retMsg: "上传成功",
    retCode: 100,
    retData: {
      path: url,
      size: req.file.size,
    },
  };
  res.send(JSON.stringify(resParams));
});

/* api -- 获取消息列表 */
app.post("/getMsgArr", (req, res) => {
  if (req.cookies.userInfo && req.cookies.userInfo.id) {
    const post = req.body;
    connection.query(
      `SELECT * from message WHERE showId = '${post.showId}'`,
      function (error, results, fields) {
        if (error) throw error;

        let showPicture = "";
        let resResults = [];
        connection.query(
          `SELECT picture from user WHERE id = '${post.showId}'`,
          (error_2, results_2) => {
            if (error_2) throw error_2;
            showPicture = results_2[0].picture;
            results.forEach((e, k) => {
              if (e.toUserId == post.showId) {
                // console.log(e)
                connection.query(
                  `SELECT picture from user WHERE id = '${e.fromUserId}'`,
                  (error_3, results_3) => {
                    // console.log(results_3)
                    const pictureObj = {
                      toUserPicture: showPicture,
                      fromUserPicture: results_3[0].picture,
                    };
                    resResults.push({
                      ...e,
                      ...pictureObj,
                    });

                    if (k === results.length - 1) {
                      const resParams = {
                        retMsg: "success",
                        retCode: 100,
                        retData: {
                          data: resResults,
                        },
                      };
                      res.send(JSON.stringify(resParams));
                    }
                  }
                );
              } else if (e.fromUserId == post.showId) {
                connection.query(
                  `SELECT picture from user WHERE id = '${e.toUserId}'`,
                  (error_3, results_3) => {
                    const pictureObj = {
                      toUserPicture: results_3[0].picture,
                      fromUserPicture: showPicture,
                    };
                    resResults.push({
                      ...e,
                      ...pictureObj,
                    });
                    if (k === results.length - 1) {
                      const resParams = {
                        retMsg: "success",
                        retCode: 100,
                        retData: {
                          data: resResults,
                        },
                      };
                      res.send(JSON.stringify(resParams));
                    }
                  }
                );
              }
            });
          }
        );
      }
    );
  } else {
    const resParams = {
      retMsg: "登陆失效",
      retCode: 104,
      retData: {},
    };
    res.send(JSON.stringify(resParams));
  }
});

app.post("/getFriend", (req, res) => {
  if (req.cookies.userInfo && req.cookies.userInfo.id) {
    connection.query(
      `SELECT friend_id from friends WHERE u_id = '${req.cookies.userInfo.id}'`,
      function (error, results, fields) {
        if (error) {
          res.send(error);
          throw error;
        }

        let queryIdArr = [];
        results.forEach((e) => {
          queryIdArr.push(e.friend_id);
        });

        if (queryIdArr.length) {
          connection.query(
            `SELECT * from user WHERE id in (${queryIdArr.join(",")})`,
            function (error_2, results_2, fields) {
              if (error_2) {
                res.send(error_2);
                throw error_2;
              }
              const resParams = {
                retMsg: "success",
                retCode: 100,
                retData: {
                  data: results_2,
                },
              };
              res.send(JSON.stringify(resParams));
            }
          );
        } else {
          const resParams = {
            retMsg: "success",
            retCode: 100,
            retData: {
              data: [],
            },
          };
          res.send(JSON.stringify(resParams));
        }
      }
    );
  } else {
    const resParams = {
      retMsg: "登陆失效",
      retCode: 104,
      retData: {},
    };
    res.send(JSON.stringify(resParams));
  }
});

app.post("/agreeFriend", (req, res) => {
  if (req.cookies.userInfo && req.cookies.userInfo.id) {
    const params = req.body;
    const sql = `INSERT INTO friends(u_id, friend_id) VALUES(${params.id}, ${req.cookies.userInfo.id}),(${req.cookies.userInfo.id}, ${params.id});`;
    connection.query(
      `DELETE FROM pending_friends WHERE u_id = ${req.cookies.userInfo.id} and friend_id = ${params.id}`,
      function (error, results, fields) {
        if (error) {
          res.send(error);
          throw error;
        }
        console.log(params);
        if (params.state == 1) {
          connection.query(sql, function (error_2, results_2, fields) {
            if (error_2) {
              res.send(error_2);
              throw error_2;
            }

            const resParams = {
              retMsg: "已添加",
              retCode: 100,
              retData: {},
            };
            res.send(JSON.stringify(resParams));
          });
        } else {
          const resParams = {
            retMsg: "已取消",
            retCode: 100,
            retData: {},
          };
          res.send(JSON.stringify(resParams));
        }
      }
    );
  } else {
    const resParams = {
      retMsg: "登陆失效",
      retCode: 104,
      retData: {},
    };
    res.send(JSON.stringify(resParams));
  }
});

app.post("/getPengingFriend", (req, res) => {
  if (req.cookies.userInfo && req.cookies.userInfo.id) {
    connection.query(
      `SELECT friend_id from pending_friends WHERE u_id = '${req.body.id}'`,
      function (error, results, fields) {
        if (error) {
          res.send(error);
          throw error;
        }

        let queryIdArr = [];
        results.forEach((e) => {
          queryIdArr.push(e.friend_id);
        });

        if (queryIdArr.length) {
          connection.query(
            `SELECT * from user WHERE id in (${queryIdArr.join(",")})`,
            function (error_2, results_2, fields) {
              if (error_2) {
                res.send(error_2);
                throw error_2;
              }
              const resParams = {
                retMsg: "success",
                retCode: 100,
                retData: {
                  data: results_2,
                },
              };
              res.send(JSON.stringify(resParams));
            }
          );
        } else {
          const resParams = {
            retMsg: "success",
            retCode: 100,
            retData: {
              data: [],
            },
          };
          res.send(JSON.stringify(resParams));
        }
      }
    );
  } else {
    const resParams = {
      retMsg: "登陆失效",
      retCode: 104,
      retData: {},
    };
    res.send(JSON.stringify(resParams));
  }
});

app.post("/addFriend", (req, res) => {
  if (req.cookies.userInfo && req.cookies.userInfo.id) {
    const params = {
      u_id: req.body.id,
      friend_id: req.cookies.userInfo.id,
    };
    const sql = "INSERT INTO pending_friends SET ?";
    connection.query(sql, params, function (error, results, fields) {
      if (error) {
        res.send(error);
        throw error;
      }

      const resParams = {
        retMsg: "请求发送成功",
        retCode: 100,
        retData: {},
      };
      res.send(JSON.stringify(resParams));
    });
  } else {
    const resParams = {
      retMsg: "登陆失效",
      retCode: 104,
      retData: {},
    };
    res.send(JSON.stringify(resParams));
  }
});

app.post("/userList", (req, res) => {
  if (req.cookies.userInfo && req.cookies.userInfo.id) {
    connection.query(`SELECT * from user`, (error, results) => {
      if (error) throw error;

      const resParams = {
        retMsg: "success",
        retCode: 100,
        retData: {
          data: results,
        },
      };
      res.send(JSON.stringify(resParams));
    });
  } else {
    const resParams = {
      retMsg: "登陆失效",
      retCode: 104,
      retData: {},
    };
    res.send(JSON.stringify(resParams));
  }
});

app.post("/userInfo", (req, res) => {
  const id = req.body.id
    ? req.body.id
    : req.cookies.userInfo
    ? req.cookies.userInfo.id
    : "";
  if (id) {
    connection.query(
      `SELECT * from user WHERE id = '${id}'`,
      (error, results) => {
        if (error) throw error;

        const resParams = {
          retMsg: "success",
          retCode: 100,
          retData: {
            data: results[0],
          },
        };
        res.send(JSON.stringify(resParams));
      }
    );
  } else {
    const resParams = {
      retMsg: "登陆失效",
      retCode: 104,
      retData: {},
    };
    res.send(JSON.stringify(resParams));
  }
});

/* 修改信息 */
app.post("/editUserInfo", (req, res) => {
  if (req.cookies.userInfo && req.cookies.userInfo.id) {
    const params = req.body;
    const sql = `UPDATE user SET picture = ?, nickname = ?, sex = ?, signature = ?, address = ? where id = ?`;

    const updateValue = [
      params.picture,
      params.nickname,
      params.sex,
      params.signature,
      params.address,
      req.cookies.userInfo.id,
    ];
    connection.query(sql, updateValue, (error, results) => {
      if (error) throw error;
      connection.query(
        `SELECT * from user WHERE id = ${req.cookies.userInfo.id}`,
        (error_2, results_2) => {
          console.log(results_2);
          res.cookie("userInfo", results_2[0], { maxAge: 6000000 }); //设置cookie和过期时间
          const resParams = {
            retMsg: "提交成功",
            retCode: 100,
            retData: {},
          };
          res.send(JSON.stringify(resParams));
        }
      );
    });
  } else {
    const resParams = {
      retMsg: "登陆失效",
      retCode: 104,
      retData: {},
    };
    res.send(JSON.stringify(resParams));
  }
});

app.post("/login", (req, res) => {
  const post = req.body;
  connection.query(
    `SELECT * from user WHERE userName = '${post.userName}'`,
    function (error, results, fields) {
      if (error) throw error;

      if (results && results.length) {
        if (post.password === results[0].password) {
          res.cookie("userInfo", results[0], { maxAge: 6000000 }); //设置cookie和过期时间
          const resParams = {
            retMsg: "登陆成功",
            retCode: 100,
            retData: {
              data: {
                id: results[0].id,
              },
            },
          };
          res.send(JSON.stringify(resParams));
        } else {
          const resParams = {
            retMsg: "用户名与密码不匹配",
            retCode: 101,
            retData: {},
          };
          res.send(JSON.stringify(resParams));
        }
      } else {
        const resParams = {
          retMsg: "该用户名不存在",
          retCode: 101,
          retData: {},
        };
        res.send(JSON.stringify(resParams));
      }
    }
  );
});

app.post("/registered", (req, res) => {
  const params = req.body;
  const sql = "INSERT INTO user SET ?";
  connection.query(
    `SELECT * from user WHERE userName = '${params.userName}'`,
    function (error, results, fields) {
      if (error) throw error;

      if (results && results.length) {
        const resParams = {
          retMsg: "该用户名已存在",
          retCode: 101,
          retData: {},
        };
        res.send(JSON.stringify(resParams));
      } else {
        connection.query(sql, params, function (error, results, fields) {
          if (error) {
            res.send(error);
            throw error;
          }

          const resParams = {
            retMsg: "注册成功",
            retCode: 100,
            retData: {},
          };
          res.send(JSON.stringify(resParams));
        });
      }
    }
  );
});
