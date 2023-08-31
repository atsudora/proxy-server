const express = require("express")  // Expressの読み込みと利用の準備
const app = express()
const { createProxyMiddleware } = require("http-proxy-middleware")
const ratelimit = require("express-rate-limit") //流量制限パッケージの読み込み
require("dotenv").config()  //環境変数を使うためのパッケージの読み込み
// const url = require("url")  //パラメータを受け取る時は記述する。

/* 
・windowMsはアクセス数の制限を設ける時間幅。ここではミリ秒を扱っているので、
 15 * 60 * 1000は15分を表している。
・maxはこの15分間に受け付けるアクセス数の上限。
*/
const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
})

/*
appの次にある.getがGETリクエストを処理することを表している。
その横の"/"がこのコードのURL、そしてresがブラウザからのリクエスト、
そしてresがブラウザに返すレスポンスを表している。
{と}の間にここで実行したい処理を書く。
ここではresの中のsendを使って()内のメッセージを返すようにしている。
*/
app.get("/", (req, res) => {
  // const params = url.parse(req.url).query //パラメータを受け取る時は記述する。
  // console.log(params) //パラメータを受け取る時は記述する。
  res.send("This is my proxy server")
})

/*
targetには、このプロキシサーバーからアクセスしたいデータ供給下のURLをかく。
フロントエンドからのリクエスト、及びそれに対するレスポンスにはヘッダー情報を書き込むスペースがあり、
changeOriginがそれに該当する。
pathRewriteはapp.useで設定しているURL（/corona-tracker-world-data）をtargetのURLに追加したり置換したりするときに使う。
*/
app.use("/corona-tracker-world-data", limiter, (req, res, next) => {
  createProxyMiddleware({
    target: process.env.BASE_API_URL_CORONA_WORLD,
    changeOrigin: true,
    pathRewrite: {
      [`^/corona-tracker-world-data`]: "",
    },
  })(req, res, next)
})

// サーバーを実行するポートの指定
const port = process.env.PORT || 5050
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

module.exports = app
