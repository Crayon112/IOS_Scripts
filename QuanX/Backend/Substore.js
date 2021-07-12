// UPDATED AT: 2021年 3月26日 星期五 20时06分13秒 CST
const $ = API("sub-store"),
  Base64 = new Base64Code();
function service() {
  console.log(
    "\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n            𝑺𝒖𝒃-𝑺𝒕𝒐𝒓𝒆 © 𝑷𝒆𝒏𝒈-𝒀𝑴\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n"
  );
  const e = express(),
    t = "settings",
    s = "subs",
    r = "collections",
    n = "rules",
    o = "builtin",
    a = "artifacts",
    i = "Auto Generated Sub-Store Backup",
    p = "Sub-Store",
    c = "Sub-Store Artifacts Repository";
  async function u({ filename: e, content: s }) {
    const { gistToken: r } = $.read(t);
    return r
      ? new Gist({ token: r, key: c }).upload({ filename: e, content: s })
      : Promise.reject("未设置Gist Token！");
  }
  function l(e) {
    const t = Object.keys(e);
    let s = "";
    for (let r of t)
      if (/USER-AGENT/i.test(r)) {
        s = e[r];
        break;
      }
    return -1 !== s.indexOf("Quantumult%20X")
      ? "QX"
      : -1 !== s.indexOf("Surge")
      ? "Surge"
      : -1 !== s.indexOf("Decar") || -1 !== s.indexOf("Loon")
      ? "Loon"
      : null;
  }
  async function f(e, t = !0) {
    const s = HTTP({ headers: { "User-Agent": "Quantumult%20X" } }),
      r = "#" + Base64.safeEncode(e),
      n = $.read(r),
      o = `#TIME-${Base64.safeEncode(e)}`,
      a = new Date().getTime() - $.read(o) > 36e5;
    if (t && n && !a) return $.log(`Use cached for resource: ${e}`), n;
    let i = "";
    try {
      i = (await s.get(e)).body;
    } catch (e) {
      throw new Error(e);
    } finally {
      $.write(i, r), $.write(new Date().getTime(), o);
    }
    if (0 === i.replace(/\s/g, "").length) throw new Error("订阅内容为空！");
    return i;
  }
  async function d(
    { type: e, item: t, platform: r, useCache: n, noProcessor: o } = {
      platform: "JSON",
      useCache: !1,
      noProcessor: !1,
    }
  ) {
    if ("subscription" === e) {
      const e = t,
        s = await f(e.url, n);
      let a = ProxyUtils.parse(s);
      return (
        o || (a = await ProxyUtils.process(a, e.process || [])),
        ProxyUtils.produce(a, r)
      );
    }
    if ("collection" === e) {
      const e = $.read(s),
        a = t,
        i = a.subscriptions;
      let p = [];
      for (let t = 0; t < i.length; t++) {
        const s = e[i[t]];
        $.info(
          `正在处理子订阅：${s.name}，进度--${
            100 * ((t + 1) / i.length).toFixed(1)
          }% `
        );
        try {
          const e = await f(s.url, n);
          let t = ProxyUtils.parse(e);
          o || (t = await ProxyUtils.process(t, s.process || [])),
            (p = p.concat(t));
        } catch (e) {
          $.error(
            `处理组合订阅中的子订阅: ${s.name}时出现错误：${e}! 该订阅已被跳过。`
          );
        }
      }
      if (
        (o || (p = await ProxyUtils.process(p, a.process || [])),
        0 === p.length)
      )
        throw new Error("组合订阅中不含有效节点！");
      return ProxyUtils.produce(p, r);
    }
    if ("rule" === e) {
      const e = t;
      let s = [];
      for (let t = 0; t < e.urls.length; t++) {
        const r = e.urls[t];
        $.info(
          `正在处理URL：${r}，进度--${
            100 * ((t + 1) / e.urls.length).toFixed(1)
          }% `
        );
        try {
          const { body: e } = await $.http.get(r),
            t = RuleUtils.parse(e);
          s = s.concat(t);
        } catch (e) {
          $.error(
            `处理分流订阅中的URL: ${r}时出现错误：${e}! 该订阅已被跳过。`
          );
        }
      }
      return (
        (s = await RuleUtils.process(s, [{ type: "Remove Duplicate Filter" }])),
        RuleUtils.produce(s, r)
      );
    }
  }
  $.read(s) || $.write({}, s),
    $.read(r) || $.write({}, r),
    $.read(t) || $.write({}, t),
    $.read(n) || $.write({}, n),
    $.read(a) || $.write({}, a),
    $.write({ rules: getBuiltInRules() }, o),
    e.get("/download/collection/:name", async function (e, t) {
      const { name: s } = e.params,
        { cache: n } = e.query || "false",
        { raw: o } = e.query || "false",
        a = e.query.target || l(e.headers) || "JSON",
        i = void 0 === n ? "JSON" === a || "URI" === a : n,
        p = $.read(r)[s];
      if (($.info(`正在下载组合订阅：${s}`), p))
        try {
          const e = await d({
            type: "collection",
            item: p,
            platform: a,
            useCache: i,
            noProcessor: o,
          });
          "JSON" === a
            ? t.set("Content-Type", "application/json;charset=utf-8").send(e)
            : t.send(e);
        } catch (e) {
          $.notify(
            "🌍 『 𝑺𝒖𝒃-𝑺𝒕𝒐𝒓𝒆 』 下载组合订阅失败",
            `❌ 下载组合订阅错误：${s}！`,
            `🤔 原因：${e}`
          ),
            t.status(500).json({ status: "failed", message: e });
        }
      else
        $.notify(
          "🌍 『 𝑺𝒖𝒃-𝑺𝒕𝒐𝒓𝒆 』 下载组合订阅失败",
          `❌ 未找到组合订阅：${s}！`
        ),
          t.status(404).json({ status: "failed" });
    }),
    e.get("/download/:name", async function (e, t) {
      const { name: r } = e.params,
        { cache: n } = e.query,
        { raw: o } = e.query || "false",
        a = e.query.target || l(e.headers) || "JSON",
        i = void 0 === n ? "JSON" === a || "URI" === a : n;
      $.info(`正在下载订阅：${r}`);
      const p = $.read(s)[r];
      if (p)
        try {
          const s = await d({
            type: "subscription",
            item: p,
            platform: a,
            useCache: i,
            noProcessor: o,
          });
          if (-1 !== ["QX", "Surge", "Loon"].indexOf(l(e.headers))) {
            const { headers: e } = await $.http.get({
                url: p.url,
                headers: {
                  "User-Agent": "Quantumult/1.0.13 (iPhone10,3; iOS 14.0)",
                },
              }),
              s = Object.keys(e).filter((e) =>
                /SUBSCRIPTION-USERINFO/i.test(e)
              )[0],
              r = e[s];
            t.set("subscription-userinfo", r);
          }
          "JSON" === a
            ? t.set("Content-Type", "application/json;charset=utf-8").send(s)
            : t.send(s);
        } catch (e) {
          $.notify(
            "🌍 『 𝑺𝒖𝒃-𝑺𝒕𝒐𝒓𝒆 』 下载订阅失败",
            `❌ 无法下载订阅：${r}！`,
            `🤔 原因：${e}`
          ),
            t.status(500).json({ status: "failed", message: e });
        }
      else
        $.notify("🌍 『 𝑺𝒖𝒃-𝑺𝒕𝒐𝒓𝒆 』 下载订阅失败", `❌ 未找到订阅：${r}！`),
          t.status(404).json({ status: "failed" });
    }),
    e
      .route("/api/sub/:name")
      .get(function (e, t) {
        const { name: r } = e.params,
          n = $.read(s)[r];
        n
          ? t.json({ status: "success", data: n })
          : t
              .status(404)
              .json({ status: "failed", message: `未找到订阅：${r}!` });
      })
      .patch(function (e, t) {
        const { name: n } = e.params;
        let o = e.body;
        const a = $.read(s);
        if (a[n]) {
          const e = { ...a[n], ...o };
          if (($.info(`正在更新订阅： ${n}`), n !== o.name)) {
            const t = $.read(r);
            for (const e of Object.keys(t)) {
              const s = t[e].subscriptions.indexOf(n);
              -1 !== s && (t[e].subscriptions[s] = o.name);
            }
            delete a[n], (a[o.name] = e);
          } else a[n] = e;
          $.write(a, s), t.json({ status: "success", data: e });
        } else t.status(500).json({ status: "failed", message: `订阅${n}不存在，无法更新！` });
      })
      .delete(function (e, t) {
        const { name: n } = e.params;
        $.info(`删除订阅：${n}...`);
        let o = $.read(s);
        delete o[n], $.write(o, s);
        let a = $.read(r);
        for (const e of Object.keys(a))
          a[e].subscriptions = a[e].subscriptions.filter((e) => e !== n);
        $.write(a, r), t.json({ status: "success" });
      }),
    e
      .route("/api/subs")
      .get(function (e, t) {
        const r = $.read(s);
        t.json({ status: "success", data: r });
      })
      .post(function (e, t) {
        const r = e.body,
          n = $.read(s);
        $.info(`正在创建订阅： ${r.name}`),
          n[r.name] &&
            t
              .status(500)
              .json({ status: "failed", message: `订阅${r.name}已存在！` });
        /^[\w-_]*$/.test(r.name)
          ? ((n[r.name] = r),
            $.write(n, s),
            t.status(201).json({ status: "success", data: r }))
          : t
              .status(500)
              .json({
                status: "failed",
                message: `订阅名称 ${r.name} 中含有非法字符！名称中只能包含英文字母、数字、下划线、横杠。`,
              });
      }),
    e.get("/api/sub/statistics/:name"),
    e
      .route("/api/collection/:name")
      .get(function (e, t) {
        const { name: s } = e.params,
          n = $.read(r)[s];
        n
          ? t.json({ status: "success", data: n })
          : t
              .status(404)
              .json({ status: "failed", message: `未找到订阅集：${s}!` });
      })
      .patch(function (e, t) {
        const { name: s } = e.params;
        let n = e.body;
        const o = $.read(r);
        if (o[s]) {
          const e = { ...o[s], ...n };
          $.info(`正在更新组合订阅：${s}...`),
            delete o[s],
            (o[n.name || s] = e),
            $.write(o, r),
            t.json({ status: "success", data: e });
        } else t.status(500).json({ status: "failed", message: `订阅集${s}不存在，无法更新！` });
      })
      .delete(function (e, t) {
        const { name: s } = e.params;
        $.info(`正在删除组合订阅：${s}`);
        let n = $.read(r);
        delete n[s], $.write(n, r), t.json({ status: "success" });
      }),
    e
      .route("/api/collections")
      .get(function (e, t) {
        const s = $.read(r);
        t.json({ status: "success", data: s });
      })
      .post(function (e, t) {
        const s = e.body;
        $.info(`正在创建组合订阅：${s.name}`);
        const n = $.read(r);
        n[s.name] &&
          t
            .status(500)
            .json({ status: "failed", message: `订阅集${s.name}已存在！` });
        /^[\w-_]*$/.test(s.name)
          ? ((n[s.name] = s),
            $.write(n, r),
            t.status(201).json({ status: "success", data: s }))
          : t
              .status(500)
              .json({
                status: "failed",
                message: `订阅集名称 ${s.name} 中含有非法字符！名称中只能包含英文字母、数字、下划线、横杠。`,
              });
      }),
    e.get("/download/rule/:name", async function (e, t) {
      const { name: s } = e.params,
        { builtin: r } = e.query,
        n = e.query.target || l(e.headers) || "Surge";
      let a;
      $.info(`正在下载${r ? "内置" : ""}分流订阅：${s}...`),
        r && (a = $.read(o).rules[s]);
      if (a) {
        const e = await d({ type: "rule", item: a, platform: n });
        t.send(e);
      } else $.notify("🌍 『 𝑺𝒖𝒃-𝑺𝒕𝒐𝒓𝒆 』 下载分流订阅失败", `❌ 未找到分流订阅：${s}！`), t.status(404).json({ status: "failed" });
    }),
    e
      .route("/api/rules")
      .post(function (e, t) {})
      .get(function (e, t) {}),
    e
      .route("/api/rule/:name")
      .patch(function (e, t) {})
      .delete(function (e, t) {})
      .get(function (e, t) {}),
    e
      .route("/api/storage")
      .get((e, t) => {
        t.json($.read("#sub-store"));
      })
      .post((e, t) => {
        const s = e.body;
        $.write(JSON.stringify(s), "#sub-store"), t.end();
      }),
    e
      .route("/api/settings")
      .get(function (e, s) {
        const r = $.read(t);
        s.json(r);
      })
      .patch(function (e, s) {
        const r = e.body,
          n = $.read(t);
        $.write({ ...n, ...r }, t), s.json({ status: "success" });
      }),
    e
      .route("/api/artifacts")
      .get(function (e, t) {
        const s = $.read(a);
        t.json({ status: "success", data: s });
      })
      .post(function (e, t) {
        const s = e.body;
        $.info(`正在创建远程配置：${s.name}`);
        const r = $.read(a);
        r[s.name]
          ? t
              .status(500)
              .json({ status: "failed", message: `远程配置${s.name}已存在！` })
          : /^[\w-_.]*$/.test(s.name)
          ? ((r[s.name] = s),
            $.write(r, a),
            t.status(201).json({ status: "success", data: s }))
          : t
              .status(500)
              .json({
                status: "failed",
                message: `远程配置名称 ${s.name} 中含有非法字符！名称中只能包含英文字母、数字、下划线、横杠。`,
              });
      }),
    e
      .route("/api/artifact/:name")
      .get(async function (e, t) {
        const o = e.params.name,
          i = e.query.action,
          p = $.read(a),
          c = p[o];
        if (c)
          if (i) {
            let e;
            switch (c.type) {
              case "subscription":
                e = $.read(s)[c.source];
                break;
              case "collection":
                e = $.read(r)[c.source];
                break;
              case "rule":
                e = $.read(n)[c.source];
            }
            const o = await d({ type: c.type, item: e, platform: c.platform });
            if ("preview" === i) t.send(o);
            else if ("sync" === i) {
              $.info(`正在上传配置：${c.name}\n>>>`),
                console.log(JSON.stringify(c, null, 2));
              try {
                const e = await u({ filename: c.name, content: o });
                c.updated = new Date().getTime();
                const s = JSON.parse(e.body);
                (c.url = s.files[c.name].raw_url.replace(
                  /\/raw\/[^\/]*\/(.*)/,
                  "/raw/$1"
                )),
                  $.write(p, a),
                  t.json({ status: "success" });
              } catch (e) {
                t.status(500).json({ status: "failed", message: e });
              }
            }
          } else t.json({ status: "success", data: c });
        else
          t.status(404).json({
            status: "failed",
            message: "未找到对应的配置！",
          });
      })
      .patch(function (e, t) {
        const s = $.read(a),
          r = e.params.name,
          n = s[r];
        if (n) {
          $.info(`正在更新远程配置：${n.name}`);
          const o = e.body;
          if (void 0 === o.name || /^[\w-_.]*$/.test(o.name)) {
            const e = { ...n, ...o };
            (s[e.name] = e),
              e.name !== r && delete s[r],
              $.write(s, a),
              t.json({ status: "success", data: e });
          } else
            t.status(500).json({
              status: "failed",
              message: `远程配置名称 ${o.name} 中含有非法字符！名称中只能包含英文字母、数字、下划线、横杠。`,
            });
        } else t.status(404).json({ status: "failed", message: "未找到对应的远程配置！" });
      })
      .delete(async function (e, t) {
        const s = e.params.name;
        $.info(`正在删除远程配置：${s}`);
        const r = $.read(a);
        try {
          const e = r[s];
          if (!e) throw new Error(`远程配置：${s}不存在！`);
          e.updated && (await u({ filename: s, content: "" })),
            delete r[s],
            $.write(r, a),
            t.json({ status: "success" });
        } catch (e) {
          delete r[s],
            $.write(r, a),
            t
              .status(500)
              .json({
                status: "failed",
                message: `无法删除远程配置：${s}, 原因：${e}`,
              });
        }
      }),
    e.get("/api/utils/IP_API/:server", async function (e, t) {
      const s = decodeURIComponent(e.params.server),
        r = await $.http
          .get(`http://ip-api.com/json/${s}?lang=zh-CN`)
          .then((e) => JSON.parse(e.body));
      t.json(r);
    }),
    e.post("/api/utils/refresh", async function (e, t) {
      const { url: s } = e.body;
      $.info(`Refreshing cache for URL: ${s}`);
      try {
        const e = await f(s, !1);
        $.write(e, `#${Base64.safeEncode(s)}`), t.json({ status: "success" });
      } catch (e) {
        t.status(500).json({
          status: "failed",
          message: `无法刷新资源 ${s}： ${e}`,
        });
      }
    }),
    e.get("/api/utils/env", function (e, t) {
      const { isNode: s, isQX: r, isLoon: n, isSurge: o } = ENV();
      let a = "Node";
      s && (a = "Node");
      r && (a = "QX");
      n && (a = "Loon");
      o && (a = "Surge");
      t.json({ backend: a });
    }),
    e.get("/api/utils/backup", async function (e, s) {
      const { action: r } = e.query,
        { gistToken: n } = $.read(t);
      if (n) {
        const e = new Gist({ token: n, key: i });
        try {
          let n;
          switch (r) {
            case "upload":
              const s = $.read(t);
              (s.syncTime = new Date().getTime()),
                $.write(s, t),
                (n = $.read("#sub-store")),
                $.info("上传备份中..."),
                await e.upload({ filename: p, content: n });
              break;
            case "download":
              $.info("还原备份中..."),
                (n = await e.download(p)),
                $.write(n, "#sub-store");
          }
          s.json({ status: "success" });
        } catch (e) {
          const t = `${"upload" === r ? "上传" : "下载"}备份失败！${e}`;
          $.error(t), s.status(500).json({ status: "failed", message: t });
        }
      } else s.status(500).json({ status: "failed", message: "未找到Gist备份Token!" });
    }),
    e.get("/api/cron/sync-artifacts", async function (e, t) {
      $.info("开始同步所有远程配置...");
      const o = $.read(a);
      let i = [],
        p = [];
      for (const e of Object.values(o))
        if (e.sync) {
          $.info(`正在同步云配置：${e.name}...`);
          try {
            let t;
            switch (e.type) {
              case "subscription":
                t = $.read(s)[e.source];
                break;
              case "collection":
                t = $.read(r)[e.source];
                break;
              case "rule":
                t = $.read(n)[e.source];
            }
            const c = await d({ type: e.type, item: t, platform: e.platform }),
              l = await u({ filename: e.name, content: c });
            e.updated = new Date().getTime();
            const f = JSON.parse(l.body);
            (e.url = f.files[e.name].raw_url.replace(
              /\/raw\/[^\/]*\/(.*)/,
              "/raw/$1"
            )),
              $.write(o, a),
              $.info(`✅ 成功同步云配置：${e.name}`),
              i.push(e);
          } catch (t) {
            $.error(`云配置: ${e.name} 同步失败！原因：${t}`),
              $.notify(
                "🌍 『 𝑺𝒖𝒃-𝑺𝒕𝒐𝒓𝒆 』 同步订阅失败",
                `❌ 无法同步订阅：${e.name}！`,
                `🤔 原因：${t}`
              ),
              p.push(e);
          }
        }
      t.json({ success: i, failed: p });
    }),
    e.get("/", async (e, t) => {
      t.set("location", "https://sub-store.vercel.app/").status(302).end();
    }),
    ENV().isQX &&
      e.options("/", async (e, t) => {
        t.status(200).end();
      }),
    e.all("/", (e, t) => {
      t.send("Hello from sub-store, made with ❤️ by Peng-YM");
    }),
    e.start();
}
service();
var ProxyUtils = (function () {
    const PROXY_PREPROCESSORS = (function () {
        return [
          {
            name: "HTML",
            test: (e) => /^<!DOCTYPE html>/.test(e),
            parse: (e) => "",
          },
          (function () {
            const e = [
              "dm1lc3M",
              "c3NyOi8v",
              "dHJvamFu",
              "c3M6Ly",
              "c3NkOi8v",
              "c2hhZG93",
              "aHR0c",
            ];
            return {
              name: "Base64 Pre-processor",
              test: function (t) {
                return e.some((e) => -1 !== t.indexOf(e));
              },
              parse: function (e) {
                return (e = Base64.safeDecode(e));
              },
            };
          })(),
          {
            name: "Clash Pre-processor",
            test: function (e) {
              return /proxies/.test(e);
            },
            parse: function (e) {
              return (
                -1 !== e.indexOf("{") &&
                  (e = e
                    .replace(/    - /g, "  - ")
                    .replace(/:(?!\s)/g, ": ")
                    .replace(/\,\"/g, ', "')
                    .replace(/: {/g, ": {,     ")
                    .replace(/, (\"?host|path|tls|mux|skip\"?)/g, ",     $1")
                    .replace(/{name: /g, '{name: "')
                    .replace(/, server:/g, '", server:')
                    .replace(/{|}/g, "")
                    .replace(/,/g, "\n   ")),
                (e =
                  -1 ===
                  (e = e
                    .replace(/  -\n.*name/g, "  - name")
                    .replace(/\$|\`/g, "")
                    .split("proxy-providers:")[0]
                    .split("proxy-groups:")[0]
                    .replace(/\"([\w-]+)\"\s*:/g, "$1:")).indexOf("proxies:")
                    ? "proxies:\n" + e
                    : "proxies:" + e.split("proxies:")[1]),
                YAML.eval(e)
                  .proxies.map((e) => JSON.stringify(e))
                  .join("\n")
              );
            },
          },
          {
            name: "SSD Pre-processor",
            test: function (e) {
              return 0 === e.indexOf("ssd://");
            },
            parse: function (e) {
              const t = [];
              let s = JSON.parse(Base64.safeDecode(e.split("ssd://")[1]));
              s.traffic_used, s.traffic_total, s.expiry, s.airport;
              let r = s.port,
                n = s.encryption,
                o = s.password,
                a = s.servers;
              for (let e = 0; e < a.length; e++) {
                let s = a[e];
                (n = s.encryption ? s.encryption : n),
                  (o = s.password ? s.password : o);
                let i = Base64.safeEncode(n + ":" + o),
                  p = s.server;
                r = s.port ? s.port : r;
                let c = s.remarks ? s.remarks : e,
                  u = s.plugin_options
                    ? "/?plugin=" +
                      encodeURIComponent(s.plugin + ";" + s.plugin_options)
                    : "";
                t[e] = "ss://" + i + "@" + p + ":" + r + u + "#" + c;
              }
              return t.join("\n");
            },
          },
        ];
      })(),
      PROXY_PARSERS = (function () {
        function e(e) {
          const t = e.split(","),
            s = {},
            r = ["shadowsocks", "vmess", "http", "trojan"];
          return (
            t.forEach((e) => {
              let [t, n] = e.split("=");
              if (((t = t.trim()), (n = n.trim()), -1 !== r.indexOf(t))) {
                s.type = t;
                const e = n.split(":");
                (s.server = e[0]), (s.port = e[1]);
              } else s[t.trim()] = n.trim();
            }),
            s
          );
        }
        function t() {
          return {
            name: "Loon HTTP Parser",
            test: (e) =>
              /^.*=\s*http/i.test(e.split(",")[0]) &&
              5 === e.split(",").length &&
              -1 === e.indexOf("username") &&
              -1 === e.indexOf("password"),
            parse: (e) => {
              const t = e.split("=")[1].split(","),
                s = {
                  name: e.split("=")[0].trim(),
                  type: "http",
                  server: t[1],
                  port: t[2],
                  tls: "443" === t[2],
                };
              return (
                t[3] && (s.username = t[3]),
                t[4] && (s.password = t[4]),
                s.tls &&
                  ((s.sni = t["tls-name"] || s.server),
                  (s["skip-cert-verify"] = JSON.parse(
                    t["skip-cert-verify"] || "false"
                  ))),
                s
              );
            },
          };
        }
        function s(e) {
          const t = {};
          t.name = e.split("=")[0].trim();
          const s = e.split(",");
          (t.server = s[1].trim()), (t.port = s[2].trim());
          for (let e = 3; e < s.length; e++) {
            const r = s[e];
            if (-1 !== r.indexOf("=")) {
              const [e, s] = r.split("=");
              t[e.trim()] = s.trim();
            }
          }
          return t;
        }
        return [
          {
            name: "URI SS Parser",
            test: (e) => /^ss:\/\//.test(e),
            parse: (e) => {
              const t = {};
              let s = e.split("ss://")[1];
              const r = {
                  name: decodeURIComponent(e.split("#")[1]),
                  type: "ss",
                  supported: t,
                },
                n = (s = s.split("#")[0]).match(/@([^\/]*)(\/|$)/)[1],
                o = n.lastIndexOf(":");
              (r.server = n.substring(0, o)), (r.port = n.substring(o + 1));
              const a = Base64.safeDecode(s.split("@")[0]).split(":");
              if (
                ((r.cipher = a[0]),
                (r.password = a[1]),
                -1 !== s.indexOf("?plugin="))
              ) {
                const e = (
                    "plugin=" +
                    decodeURIComponent(s.split("?plugin=")[1].split("&")[0])
                  ).split(";"),
                  n = {};
                for (const t of e) {
                  const [e, s] = t.split("=");
                  e && (n[e] = s || !0);
                }
                switch (n.plugin) {
                  case "obfs-local":
                  case "simple-obfs":
                    (r.plugin = "obfs"),
                      (r["plugin-opts"] = {
                        mode: n.obfs,
                        host: n["obfs-host"],
                      });
                    break;
                  case "v2ray-plugin":
                    (r.supported = { ...t, Loon: !1, Surge: !1 }),
                      (r.obfs = "v2ray-plugin"),
                      (r["plugin-opts"] = {
                        mode: "websocket",
                        host: n["obfs-host"],
                        path: n.path || "",
                        tls: n.tls || !1,
                      });
                    break;
                  default:
                    throw new Error(`Unsupported plugin option: ${n.plugin}`);
                }
              }
              return r;
            },
          },
          (function () {
            const e = { Surge: !1 };
            return {
              name: "URI SSR Parser",
              test: (e) => /^ssr:\/\//.test(e),
              parse: (t) => {
                let s = (t = Base64.safeDecode(t.split("ssr://")[1])).indexOf(
                  ":origin"
                );
                -1 === s && (s = t.indexOf(":auth_"));
                const r = t.substring(0, s),
                  n = r.substring(0, r.lastIndexOf(":")),
                  o = r.substring(r.lastIndexOf(":") + 1);
                let a = t
                    .substring(s + 1)
                    .split("/?")[0]
                    .split(":"),
                  i = {
                    type: "ssr",
                    server: n,
                    port: o,
                    protocol: a[0],
                    cipher: a[1],
                    obfs: a[2],
                    password: Base64.safeDecode(a[3]),
                    supported: e,
                  };
                const p = {};
                if ((t = t.split("/?")[1].split("&")).length > 1)
                  for (const e of t) {
                    const [t, s] = e.split("=");
                    p[t] = s.trim();
                  }
                return (i = {
                  ...i,
                  name: p.remarks ? Base64.safeDecode(p.remarks) : i.server,
                  "protocol-param": Base64.safeDecode(
                    p.protoparam || ""
                  ).replace(/\s/g, ""),
                  "obfs-param": Base64.safeDecode(p.obfsparam || "").replace(
                    /\s/g,
                    ""
                  ),
                });
              },
            };
          })(),
          {
            name: "URI VMess Parser",
            test: (e) => /^vmess:\/\//.test(e),
            parse: (e) => {
              const t = {};
              e = e.split("vmess://")[1];
              const s = Base64.safeDecode(e);
              if (/=\s*vmess/.test(s)) {
                const e = s.split(",").map((e) => e.trim()),
                  t = {};
                for (const s of e)
                  if (-1 !== s.indexOf("=")) {
                    const [e, r] = s.split("=");
                    t[e.trim()] = r.trim();
                  }
                const r = {
                  name: e[0].split("=")[0].trim(),
                  type: "vmess",
                  server: e[1],
                  port: e[2],
                  cipher: e[3],
                  uuid: e[4].match(/^"(.*)"$/)[1],
                  tls: "over-tls" === t.obfs || "wss" === t.obfs,
                };
                if (
                  (void 0 !== t["udp-relay"] &&
                    (r.udp = JSON.parse(t["udp-relay"])),
                  void 0 !== t["fast-open"] &&
                    (r.udp = JSON.parse(t["fast-open"])),
                  "ws" === t.obfs || "wss" === t.obfs)
                ) {
                  (r.network = "ws"),
                    (r["ws-path"] = (t["obfs-path"] || '"/"').match(
                      /^"(.*)"$/
                    )[1]);
                  let e = t["obfs-header"];
                  e &&
                    -1 !== e.indexOf("Host") &&
                    (e = e.match(/Host:\s*([a-zA-Z0-9-.]*)/)[1]),
                    (r["ws-headers"] = { Host: e || r.server });
                }
                return (
                  r.tls &&
                    "false" === t['"tls-verification"'] &&
                    (r["skip-cert-verify"] = !0),
                  r.tls && t["obfs-host"] && (r.sni = t["obfs-host"]),
                  r
                );
              }
              {
                const e = JSON.parse(s),
                  r = {
                    name: e.ps,
                    type: "vmess",
                    server: e.add,
                    port: e.port,
                    cipher: "auto",
                    uuid: e.id,
                    alterId: e.aid || 0,
                    tls: "tls" === e.tls || !0 === e.tls,
                    supported: t,
                  };
                return (
                  "ws" === e.net &&
                    ((r.network = "ws"),
                    (r["ws-path"] = e.path),
                    (r["ws-headers"] = { Host: e.host || e.add }),
                    r.tls && e.host && (r.sni = e.host)),
                  !1 === e.verify_cert && (r["skip-cert-verify"] = !0),
                  r
                );
              }
            },
          },
          {
            name: "URI Trojan Parser",
            test: (e) => /^trojan:\/\//.test(e),
            parse: (e) => {
              e = e.split("trojan://")[1];
              const [t, s] = e.split("@")[1].split("?")[0].split(":");
              return {
                name:
                  decodeURIComponent(e.split("#")[1].trim()) || `[Trojan] ${t}`,
                type: "trojan",
                server: t,
                port: s,
                password: e.split("@")[0],
                supported: {},
              };
            },
          },
          {
            name: "Clash Parser",
            test: (e) => {
              try {
                JSON.parse(e);
              } catch (e) {
                return !1;
              }
              return !0;
            },
            parse: (e) => JSON.parse(e),
          },
          {
            name: "Surge SS Parser",
            test: (e) => /^.*=\s*ss/.test(e.split(",")[0]),
            parse: (e) => {
              const t = s(e),
                r = {
                  name: t.name,
                  type: "ss",
                  server: t.server,
                  port: t.port,
                  cipher: t["encrypt-method"],
                  password: t.password,
                  tfo: JSON.parse(t.tfo || "false"),
                  udp: JSON.parse(t["udp-relay"] || "false"),
                };
              return (
                t.obfs &&
                  ((r.plugin = "obfs"),
                  (r["plugin-opts"] = { mode: t.obfs, host: t["obfs-host"] })),
                r
              );
            },
          },
          {
            name: "Surge VMess Parser",
            test: (e) =>
              /^.*=\s*vmess/.test(e.split(",")[0]) &&
              -1 !== e.indexOf("username"),
            parse: (e) => {
              const t = s(e),
                r = {
                  name: t.name,
                  type: "vmess",
                  server: t.server,
                  port: t.port,
                  uuid: t.username,
                  alterId: 0,
                  cipher: "none",
                  tls: JSON.parse(t.tls || "false"),
                  tfo: JSON.parse(t.tfo || "false"),
                };
              if (
                (r.tls &&
                  (void 0 !== t["skip-cert-verify"] &&
                    (r["skip-cert-verify"] =
                      !0 === t["skip-cert-verify"] ||
                      "1" === t["skip-cert-verify"]),
                  (r.sni = t.sni || t.server)),
                JSON.parse(t.ws || "false"))
              ) {
                (r.network = "ws"), (r["ws-path"] = t["ws-path"]);
                const e = t["ws-headers"].match(/(,|^|\s)*HOST:\s*(.*?)(,|$)/),
                  s = e ? e[2] : r.server;
                r["ws-headers"] = { Host: s || t.server };
              }
              return r;
            },
          },
          {
            name: "Surge Trojan Parser",
            test: (e) =>
              /^.*=\s*trojan/.test(e.split(",")[0]) && -1 !== e.indexOf("sni"),
            parse: (e) => {
              const t = s(e),
                r = {
                  name: t.name,
                  type: "trojan",
                  server: t.server,
                  port: t.port,
                  password: t.password,
                  sni: t.sni || t.server,
                  tfo: JSON.parse(t.tfo || "false"),
                };
              return (
                void 0 !== t["skip-cert-verify"] &&
                  (r["skip-cert-verify"] =
                    !0 === t["skip-cert-verify"] ||
                    "1" === t["skip-cert-verify"]),
                r
              );
            },
          },
          {
            name: "Surge HTTP Parser",
            test: (e) => /^.*=\s*http/.test(e.split(",")[0]) && !t().test(e),
            parse: (e) => {
              const t = s(e),
                r = {
                  name: t.name,
                  type: "http",
                  server: t.server,
                  port: t.port,
                  tls: JSON.parse(t.tls || "false"),
                  tfo: JSON.parse(t.tfo || "false"),
                };
              return (
                r.tls &&
                  (void 0 !== t["skip-cert-verify"] &&
                    (r["skip-cert-verify"] =
                      !0 === t["skip-cert-verify"] ||
                      "1" === t["skip-cert-verify"]),
                  (r.sni = t.sni || t.server)),
                t.username &&
                  "none" !== t.username &&
                  (r.username = t.username),
                t.password &&
                  "none" !== t.password &&
                  (r.password = t.password),
                r
              );
            },
          },
          {
            name: "Loon SS Parser",
            test: (e) =>
              "shadowsocks" ===
              e.split(",")[0].split("=")[1].trim().toLowerCase(),
            parse: (e) => {
              const t = e.split("=")[1].split(","),
                s = {
                  name: e.split("=")[0].trim(),
                  type: "ss",
                  server: t[1],
                  port: t[2],
                  cipher: t[3],
                  password: t[4].replace(/"/g, ""),
                };
              return (
                t.length > 5 &&
                  ((s.plugin = "obfs"),
                  (s["plugin-opts"] = { mode: t[5], host: t[6] })),
                s
              );
            },
          },
          {
            name: "Loon SSR Parser",
            test: (e) =>
              "shadowsocksr" ===
              e.split(",")[0].split("=")[1].trim().toLowerCase(),
            parse: (e) => {
              const t = e.split("=")[1].split(",");
              return {
                name: e.split("=")[0].trim(),
                type: "ssr",
                server: t[1],
                port: t[2],
                cipher: t[3],
                password: t[4].replace(/"/g, ""),
                protocol: t[5],
                "protocol-param": t[6].match(/{(.*)}/)[1],
                supported: { Surge: !1 },
                obfs: t[7],
                "obfs-param": t[8].match(/{(.*)}/)[1],
              };
            },
          },
          {
            name: "Loon VMess Parser",
            test: (e) =>
              /^.*=\s*vmess/i.test(e.split(",")[0]) &&
              -1 === e.indexOf("username"),
            parse: (e) => {
              let t = e.split("=")[1].split(",");
              const s = {
                name: e.split("=")[0].trim(),
                type: "vmess",
                server: t[1],
                port: t[2],
                cipher: t[3] || "none",
                uuid: t[4].replace(/"/g, ""),
                alterId: 0,
              };
              t = t.splice(5);
              for (const e of t) {
                const [s, r] = e.split(":");
                t[s] = r;
              }
              switch (
                ((s.tls = JSON.parse(t["over-tls"] || "false")),
                s.tls &&
                  ((s.sni = t["tls-name"] || s.server),
                  (s["skip-cert-verify"] = JSON.parse(
                    t["skip-cert-verify"] || "false"
                  ))),
                t.transport)
              ) {
                case "tcp":
                  break;
                case "ws":
                  (s.network = t.transport),
                    (s["ws-path"] = t.path),
                    (s["ws-headers"] = { Host: t.host });
              }
              return (
                s.tls &&
                  (s["skip-cert-verify"] = JSON.parse(
                    t["skip-cert-verify"] || "false"
                  )),
                s
              );
            },
          },
          {
            name: "Loon Trojan Parser",
            test: (e) =>
              /^.*=\s*trojan/i.test(e.split(",")[0]) &&
              -1 === e.indexOf("password"),
            parse: (e) => {
              const t = e.split("=")[1].split(","),
                s = {
                  name: e.split("=")[0].trim(),
                  type: "trojan",
                  server: t[1],
                  port: t[2],
                  password: t[3].replace(/"/g, ""),
                  sni: t[1],
                  "skip-cert-verify": JSON.parse(
                    t["skip-cert-verify"] || "false"
                  ),
                };
              if (t.length > 4) {
                const [r, n] = t[4].split(":");
                if ("tls-name" !== r)
                  throw new Error(`Unknown option ${r} for line: \n${e}`);
                s.sni = n;
              }
              return s;
            },
          },
          t(),
          {
            name: "QX SS Parser",
            test: (e) =>
              /^shadowsocks\s*=/.test(e.split(",")[0].trim()) &&
              -1 === e.indexOf("ssr-protocol"),
            parse: (t) => {
              const s = e(t),
                r = {
                  name: s.tag,
                  type: "ss",
                  server: s.server,
                  port: s.port,
                  cipher: s.method,
                  password: s.password,
                  udp: JSON.parse(s["udp-relay"] || "false"),
                  tfo: JSON.parse(s["fast-open"] || "false"),
                  supported: {},
                };
              if (s.obfs)
                switch (
                  ((r["plugin-opts"] = { host: s["obfs-host"] || r.server }),
                  s.obfs)
                ) {
                  case "http":
                  case "tls":
                    (r.plugin = "obfs"), (r["plugin-opts"].mode = s.obfs);
                    break;
                  case "ws":
                  case "wss":
                    (r["plugin-opts"] = {
                      ...r["plugin-opts"],
                      mode: "websocket",
                      path: s["obfs-uri"] || "/",
                      tls: "wss" === s.obfs,
                    }),
                      r["plugin-opts"].tls &&
                        void 0 !== s["tls-verification"] &&
                        (r["plugin-opts"]["skip-cert-verify"] =
                          s["tls-verification"]),
                      (r.plugin = "v2ray-plugin"),
                      (r.supported.Surge = !1),
                      (r.supported.Loon = !1);
                }
              return r;
            },
          },
          {
            name: "QX SSR Parser",
            test: (e) =>
              /^shadowsocks\s*=/.test(e.split(",")[0].trim()) &&
              -1 !== e.indexOf("ssr-protocol"),
            parse: (t) => {
              const s = e(t),
                r = {
                  name: s.tag,
                  type: "ssr",
                  server: s.server,
                  port: s.port,
                  cipher: s.method,
                  password: s.password,
                  protocol: s["ssr-protocol"],
                  obfs: "plain",
                  "protocol-param": s["ssr-protocol-param"],
                  udp: JSON.parse(s["udp-relay"] || "false"),
                  tfo: JSON.parse(s["fast-open"] || "false"),
                  supported: { Surge: !1 },
                };
              return (
                s.obfs &&
                  ((r.obfs = s.obfs), (r["obfs-param"] = s["obfs-host"])),
                r
              );
            },
          },
          {
            name: "QX VMess Parser",
            test: (e) => /^vmess\s*=/.test(e.split(",")[0].trim()),
            parse: (t) => {
              const s = e(t),
                r = {
                  type: "vmess",
                  name: s.tag,
                  server: s.server,
                  port: s.port,
                  cipher: s.method || "none",
                  uuid: s.password,
                  alterId: 0,
                  tls: "over-tls" === s.obfs || "wss" === s.obfs,
                  udp: JSON.parse(s["udp-relay"] || "false"),
                  tfo: JSON.parse(s["fast-open"] || "false"),
                };
              return (
                r.tls &&
                  ((r.sni = s["obfs-host"] || s.server),
                  (r["skip-cert-verify"] = !JSON.parse(
                    s["tls-verification"] || "true"
                  ))),
                ("ws" !== s.obfs && "wss" !== s.obfs) ||
                  ((r.network = "ws"),
                  (r["ws-path"] = s["obfs-uri"]),
                  (r["ws-headers"] = { Host: s["obfs-host"] || s.server })),
                r
              );
            },
          },
          {
            name: "QX Trojan Parser",
            test: (e) => /^trojan\s*=/.test(e.split(",")[0].trim()),
            parse: (t) => {
              const s = e(t),
                r = {
                  type: "trojan",
                  name: s.tag,
                  server: s.server,
                  port: s.port,
                  password: s.password,
                  sni: s["tls-host"] || s.server,
                  udp: JSON.parse(s["udp-relay"] || "false"),
                  tfo: JSON.parse(s["fast-open"] || "false"),
                };
              return (
                (r["skip-cert-verify"] = !JSON.parse(
                  s["tls-verification"] || "true"
                )),
                r
              );
            },
          },
          {
            name: "QX HTTP Parser",
            test: (e) => /^http\s*=/.test(e.split(",")[0].trim()),
            parse: (t) => {
              const s = e(t),
                r = {
                  type: "http",
                  name: s.tag,
                  server: s.server,
                  port: s.port,
                  tls: JSON.parse(s["over-tls"] || "false"),
                  udp: JSON.parse(s["udp-relay"] || "false"),
                  tfo: JSON.parse(s["fast-open"] || "false"),
                };
              return (
                s.username &&
                  "none" !== s.username &&
                  (r.username = s.username),
                s.password &&
                  "none" !== s.password &&
                  (r.password = s.password),
                r.tls &&
                  ((r.sni = s["tls-host"] || r.server),
                  (r["skip-cert-verify"] = !JSON.parse(
                    s["tls-verification"] || "true"
                  ))),
                r
              );
            },
          },
        ];
      })(),
      PROXY_PROCESSORS = (function () {
        function SetPropertyOperator({ key: e, value: t }) {
          return {
            name: "Set Property Operator",
            func: (s) => s.map((s) => ((s[e] = t), s)),
          };
        }
        function FlagOperator(e = !0) {
          return {
            name: "Flag Operator",
            func: (t) =>
              t.map((t) => {
                if (e) {
                  const e = getFlag(t.name);
                  (t.name = removeFlag(t.name)),
                    (t.name = e + " " + t.name),
                    (t.name = t.name.replace(/🇹🇼/g, "🇨🇳"));
                } else t.name = removeFlag(t.name);
                return t;
              }),
          };
        }
        function SortOperator(e = "asc") {
          return {
            name: "Sort Operator",
            func: (t) => {
              switch (e) {
                case "asc":
                case "desc":
                  return t.sort((t, s) => {
                    let r = t.name > s.name ? 1 : -1;
                    return (r *= "desc" === e ? -1 : 1);
                  });
                case "random":
                  return shuffle(t);
                default:
                  throw new Error("Unknown sort option: " + e);
              }
            },
          };
        }
        function RegexSortOperator(e) {
          return {
            name: "Regex Sort Operator",
            func: (t) => (
              (e = e.map((e) => buildRegex(e))),
              t.sort((t, s) => {
                const r = getRegexOrder(e, t.name),
                  n = getRegexOrder(e, s.name);
                return r && !n
                  ? -1
                  : n && !r
                  ? 1
                  : r && n
                  ? r < n
                    ? -1
                    : 1
                  : (!r && !n) || (r && n && r === n)
                  ? t.name < s.name
                    ? -1
                    : 1
                  : void 0;
              })
            ),
          };
        }
        function getRegexOrder(e, t) {
          let s = null;
          for (let r = 0; r < e.length; r++)
            if (e[r].test(t)) {
              s = r + 1;
              break;
            }
          return s;
        }
        function RegexRenameOperator(e) {
          return {
            name: "Regex Rename Operator",
            func: (t) =>
              t.map((t) => {
                for (const { expr: s, now: r } of e)
                  t.name = t.name.replace(buildRegex(s, "g"), r).trim();
                return t;
              }),
          };
        }
        function RegexDeleteOperator(e) {
          return {
            name: "Regex Delete Operator",
            func: RegexRenameOperator(e.map((e) => ({ expr: e, now: "" })))
              .func,
          };
        }
        function ScriptOperator(script) {
          return {
            name: "Script Operator",
            func: (proxies) => {
              let output = proxies;
              return (
                (function () {
                  const $get = (e, t) => {
                      return (0, PROXY_PROCESSORS[e])(t);
                    },
                    $process = ApplyProcessor;
                  eval(script), (output = operator(proxies));
                })(),
                output
              );
            },
          };
        }
        function UselessFilter() {
          return {
            name: "Useless Filter",
            func: RegexFilter({
              regex: [
                "网址",
                "流量",
                "时间",
                "应急",
                "过期",
                "Bandwidth",
                "expire",
              ],
              keep: !1,
            }).func,
          };
        }
        function RegionFilter(e) {
          const t = {
            HK: "🇭🇰",
            TW: "🇹🇼",
            US: "🇺🇸",
            SG: "🇸🇬",
            JP: "🇯🇵",
            UK: "🇬🇧",
          };
          return {
            name: "Region Filter",
            func: (s) =>
              s.map((s) => {
                const r = getFlag(s.name);
                return e.some((e) => t[e] === r);
              }),
          };
        }
        function RegexFilter({ regex: e = [], keep: t = !0 }) {
          return {
            name: "Regex Filter",
            func: (s) =>
              s.map((s) => {
                const r = e.some((e) => buildRegex(e).test(s.name));
                return t ? r : !r;
              }),
          };
        }
        function TypeFilter(e) {
          return {
            name: "Type Filter",
            func: (t) => t.map((t) => e.some((e) => t.type === e)),
          };
        }
        function ScriptFilter(script) {
          return {
            name: "Script Filter",
            func: (proxies) => {
              let output = FULL(proxies.length, !0);
              return (
                (function () {
                  eval(script), (output = filter(proxies));
                })(),
                output
              );
            },
          };
        }
        function getFlag(e) {
          const t = {
            "🇦🇨": ["AC"],
            "🇦🇹": ["奥地利", "维也纳"],
            "🇦🇺": [
              "AU",
              "Australia",
              "Sydney",
              "澳大利亚",
              "澳洲",
              "墨尔本",
              "悉尼",
            ],
            "🇧🇪": ["BE", "比利时"],
            "🇧🇬": ["保加利亚", "Bulgaria"],
            "🇧🇷": ["BR", "Brazil", "巴西", "圣保罗"],
            "🇨🇦": [
              "CA",
              "Canada",
              "Waterloo",
              "加拿大",
              "蒙特利尔",
              "温哥华",
              "楓葉",
              "枫叶",
              "滑铁卢",
              "多伦多",
            ],
            "🇨🇭": ["瑞士", "苏黎世", "Switzerland"],
            "🇩🇪": ["DE", "German", "GERMAN", "德国", "德國", "法兰克福"],
            "🇩🇰": ["丹麦"],
            "🇪🇸": ["ES", "西班牙", "Spain"],
            "🇪🇺": ["EU", "欧盟", "欧罗巴"],
            "🇫🇮": ["Finland", "芬兰", "赫尔辛基"],
            "🇫🇷": ["FR", "France", "法国", "法國", "巴黎"],
            "🇬🇧": [
              "UK",
              "GB",
              "England",
              "United Kingdom",
              "英国",
              "伦敦",
              "英",
            ],
            "🇲🇴": ["MO", "Macao", "澳门", "CTM"],
            "🇭🇺": ["匈牙利", "Hungary"],
            "🇭🇰": [
              "HK",
              "Hongkong",
              "Hong Kong",
              "香港",
              "深港",
              "沪港",
              "呼港",
              "HKT",
              "HKBN",
              "HGC",
              "WTT",
              "CMI",
              "穗港",
              "京港",
              "港",
            ],
            "🇮🇩": ["Indonesia", "印尼", "印度尼西亚", "雅加达"],
            "🇮🇪": ["Ireland", "爱尔兰", "都柏林"],
            "🇮🇳": ["India", "印度", "孟买", "Mumbai"],
            "🇰🇵": ["KP", "朝鲜"],
            "🇰🇷": ["KR", "Korea", "KOR", "韩国", "首尔", "韩", "韓"],
            "🇱🇻": ["Latvia", "Latvija", "拉脱维亚"],
            "🇲🇽️": ["MEX", "MX", "墨西哥"],
            "🇲🇾": ["MY", "Malaysia", "马来西亚", "吉隆坡"],
            "🇳🇱": ["NL", "Netherlands", "荷兰", "荷蘭", "尼德蘭", "阿姆斯特丹"],
            "🇵🇭": ["PH", "Philippines", "菲律宾"],
            "🇷🇴": ["RO", "罗马尼亚"],
            "🇷🇺": [
              "RU",
              "Russia",
              "俄罗斯",
              "俄羅斯",
              "伯力",
              "莫斯科",
              "圣彼得堡",
              "西伯利亚",
              "新西伯利亚",
              "京俄",
              "杭俄",
            ],
            "🇸🇦": ["沙特", "迪拜"],
            "🇸🇪": ["SE", "Sweden"],
            "🇸🇬": [
              "SG",
              "Singapore",
              "新加坡",
              "狮城",
              "沪新",
              "京新",
              "泉新",
              "穗新",
              "深新",
              "杭新",
              "广新",
            ],
            "🇹🇭": ["TH", "Thailand", "泰国", "泰國", "曼谷"],
            "🇹🇷": ["TR", "Turkey", "土耳其", "伊斯坦布尔"],
            "🇹🇼": [
              "TW",
              "Taiwan",
              "台湾",
              "台北",
              "台中",
              "新北",
              "彰化",
              "CHT",
              "台",
              "HINET",
            ],
            "🇺🇸": [
              "US",
              "USA",
              "America",
              "United States",
              "美国",
              "美",
              "京美",
              "波特兰",
              "达拉斯",
              "俄勒冈",
              "凤凰城",
              "费利蒙",
              "硅谷",
              "矽谷",
              "拉斯维加斯",
              "洛杉矶",
              "圣何塞",
              "圣克拉拉",
              "西雅图",
              "芝加哥",
              "沪美",
              "哥伦布",
              "纽约",
            ],
            "🇻🇳": ["VN", "越南", "胡志明市"],
            "🇮🇹": ["Italy", "IT", "Nachash", "意大利", "米兰", "義大利"],
            "🇿🇦": ["South Africa", "南非"],
            "🇦🇪": ["United Arab Emirates", "阿联酋"],
            "🇯🇵": [
              "JP",
              "Japan",
              "日",
              "日本",
              "东京",
              "大阪",
              "埼玉",
              "沪日",
              "穗日",
              "川日",
              "中日",
              "泉日",
              "杭日",
              "深日",
              "辽日",
              "广日",
            ],
            "🇦🇷": ["AR", "阿根廷"],
            "🇳🇴": ["Norway", "挪威", "NO"],
            "🇨🇳": [
              "CN",
              "China",
              "回国",
              "中国",
              "江苏",
              "北京",
              "上海",
              "广州",
              "深圳",
              "杭州",
              "徐州",
              "青岛",
              "宁波",
              "镇江",
              "back",
            ],
            "🏳️‍🌈": ["流量", "时间", "应急", "过期", "Bandwidth", "expire"],
          };
          for (let s of Object.keys(t))
            if (t[s].some((t) => -1 !== e.indexOf(t))) return s;
          return (
            (e.match(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/) ||
              [])[0] || "🏴‍☠️"
          );
        }
        function removeFlag(e) {
          return e
            .replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "")
            .trim();
        }
        function shuffle(e) {
          let t,
            s,
            r = e.length;
          for (; 0 !== r; )
            (s = Math.floor(Math.random() * r)),
              (t = e[(r -= 1)]),
              (e[r] = e[s]),
              (e[s] = t);
          return e;
        }
        return {
          "Useless Filter": UselessFilter,
          "Region Filter": RegionFilter,
          "Regex Filter": RegexFilter,
          "Type Filter": TypeFilter,
          "Script Filter": ScriptFilter,
          "Set Property Operator": SetPropertyOperator,
          "Flag Operator": FlagOperator,
          "Sort Operator": SortOperator,
          "Regex Sort Operator": RegexSortOperator,
          "Regex Rename Operator": RegexRenameOperator,
          "Regex Delete Operator": RegexDeleteOperator,
          "Script Operator": ScriptOperator,
        };
      })(),
      PROXY_PRODUCERS = (function () {
        return {
          QX: {
            produce: (e) => {
              let t, s;
              switch (e.type) {
                case "ss":
                  if (((t = ""), "obfs" === e.plugin)) {
                    const { host: s, mode: r } = e["plugin-opts"];
                    t = `,obfs=${r}${s ? ",obfs-host=" + s : ""}`;
                  }
                  if ("v2ray-plugin" === e.plugin) {
                    const { tls: s, host: r, path: n } = e["plugin-opts"];
                    t = `,obfs=${s ? "wss" : "ws"}${
                      r ? ",obfs-host=" + r : ""
                    }${n ? ",obfs-uri=" + n : ""}`;
                  }
                  return `shadowsocks=${e.server}:${e.port},method=${
                    e.cipher
                  },password=${e.password}${t}${
                    e.tfo ? ",fast-open=true" : ",fast-open=false"
                  }${e.udp ? ",udp-relay=true" : ",udp-relay=false"},tag=${
                    e.name
                  }`;
                case "ssr":
                  return `shadowsocks=${e.server}:${e.port},method=${
                    e.cipher
                  },password=${e.password},ssr-protocol=${e.protocol}${
                    e["protocol-param"]
                      ? ",ssr-protocol-param=" + e["protocol-param"]
                      : ""
                  }${e.obfs ? ",obfs=" + e.obfs : ""}${
                    e["obfs-param"] ? ",obfs-host=" + e["obfs-param"] : ""
                  }${e.tfo ? ",fast-open=true" : ",fast-open=false"}${
                    e.udp ? ",udp-relay=true" : ",udp-relay=false"
                  },tag=${e.name}`;
                case "vmess":
                  return (
                    (t = ""),
                    "ws" === e.network
                      ? (t = e.tls
                          ? `,obfs=wss${e.sni ? ",obfs-host=" + e.sni : ""}${
                              e["ws-path"] ? ",obfs-uri=" + e["ws-path"] : ""
                            },tls-verification=${
                              e["skip-cert-verify"] ? "false" : "true"
                            }`
                          : `,obfs=ws${
                              e["ws-headers"].Host
                                ? ",obfs-host=" + e["ws-headers"].Host
                                : ""
                            }${
                              e["ws-path"] ? ",obfs-uri=" + e["ws-path"] : ""
                            }`)
                      : e.tls &&
                        (t = `,obfs=over-tls${
                          e.sni ? ",obfs-host=" + e.sni : ""
                        },tls-verification=${
                          e["skip-cert-verify"] ? "false" : "true"
                        }`),
                    `vmess=${e.server}:${e.port},method=${
                      "auto" === e.cipher ? "none" : e.cipher
                    },password=${e.uuid}${t}${
                      e.tfo ? ",fast-open=true" : ",fast-open=false"
                    }${e.udp ? ",udp-relay=true" : ",udp-relay=false"},tag=${
                      e.name
                    }`
                  );
                case "trojan":
                  return `trojan=${e.server}:${e.port},password=${e.password}${
                    e.sni ? ",tls-host=" + e.sni : ""
                  },over-tls=true,tls-verification=${
                    e["skip-cert-verify"] ? "false" : "true"
                  }${e.tfo ? ",fast-open=true" : ",fast-open=false"}${
                    e.udp ? ",udp-relay=true" : ",udp-relay=false"
                  },tag=${e.name}`;
                case "http":
                  return (
                    (s = ""),
                    e.tls &&
                      (s = `,over-tls=true,tls-verification=${
                        e["skip-cert-verify"] ? "false" : "true"
                      }${e.sni ? ",tls-host=" + e.sni : ""}`),
                    `http=${e.server}:${e.port},username=${
                      e.username
                    },password=${e.password}${s}${
                      e.tfo ? ",fast-open=true" : ",fast-open=false"
                    },tag=${e.name}`
                  );
              }
              throw new Error(
                `Platform QX does not support proxy type: ${e.type}`
              );
            },
          },
          Surge: {
            produce: (e) => {
              let t, s;
              switch (e.type) {
                case "ss":
                  if (((t = ""), e.plugin)) {
                    const { host: s, mode: r } = e["plugin-opts"];
                    if ("obfs" !== e.plugin)
                      throw new Error(
                        `Platform Surge does not support obfs option: ${e.obfs}`
                      );
                    t = `,obfs=${r}${s ? ",obfs-host=" + s : ""}`;
                  }
                  return `${e.name}=ss,${e.server}, ${e.port},encrypt-method=${
                    e.cipher
                  },password=${e.password}${t},tfo=${
                    e.tfo || "false"
                  },udp-relay=${e.udp || "false"}`;
                case "vmess":
                  s = "";
                  let r = `${e.name}=vmess,${e.server},${e.port},username=${
                    e.uuid
                  },tls=${e.tls || "false"},tfo=${e.tfo || "false"}`;
                  if ("ws" === e.network) {
                    const t = e["ws-path"] || "/",
                      s = e["ws-headers"].Host;
                    r += `,ws=true${t ? ",ws-path=" + t : ""}${
                      s ? ",ws-headers=HOST:" + s : ""
                    }`;
                  }
                  return (
                    e.tls &&
                      ((r += `${
                        void 0 !== e["skip-cert-verify"]
                          ? ",skip-cert-verify=" + e["skip-cert-verify"]
                          : ""
                      }`),
                      (r += e.sni ? `,sni=${e.sni}` : "")),
                    r
                  );
                case "trojan":
                  return `${e.name}=trojan,${e.server},${e.port},password=${
                    e.password
                  }${
                    void 0 !== e["skip-cert-verify"]
                      ? ",skip-cert-verify=" + e["skip-cert-verify"]
                      : ""
                  }${e.sni ? ",sni=" + e.sni : ""},tfo=${e.tfo || "false"}`;
                case "http":
                  return (
                    (s = ", tls=false"),
                    e.tls &&
                      (s = `,tls=true,skip-cert-verify=${e["skip-cert-verify"]},sni=${e.sni}`),
                    `${e.name}=http, ${e.server}, ${e.port}${
                      e.username ? ",username=" + e.username : ""
                    }${e.password ? ",password=" + e.password : ""}${s},tfo=${
                      e.tfo || "false"
                    }`
                  );
              }
              throw new Error(
                `Platform Surge does not support proxy type: ${e.type}`
              );
            },
          },
          Loon: {
            produce: (e) => {
              let t, s, r, n;
              switch (
                (void 0 !== e.udp && (r = e.udp ? ",udp=true" : ",udp=false"),
                void 0 !== e.tfo &&
                  (n = e.tfo ? ",fast-open=true" : ",fast-open=false"),
                e.type)
              ) {
                case "ss":
                  if (((t = ",,"), e.plugin)) {
                    if ("obfs" !== e.plugin)
                      throw new Error(
                        `Platform Loon does not support obfs option: ${e.obfs}`
                      );
                    {
                      const { mode: s, host: r } = e["plugin-opts"];
                      t = `,${s},${r || ""}`;
                    }
                  }
                  return `${e.name}=shadowsocks,${e.server},${e.port},${e.cipher},"${e.password}"${t}${r}${n}`;
                case "ssr":
                  return `${e.name}=shadowsocksr,${e.server},${e.port},${
                    e.cipher
                  },"${e.password}",${e.protocol},{${
                    e["protocol-param"] || ""
                  }},${e.obfs},{${e["obfs-param"] || ""}}${r}${n}`;
                case "vmess":
                  return (
                    (t = ""),
                    (t =
                      "ws" === e.network
                        ? `,transport:ws,host:${
                            e["ws-headers"].Host || e.server
                          },path:${e["ws-path"] || "/"}`
                        : ",transport:tcp"),
                    e.tls &&
                      (t += `${
                        e.sni ? ",tls-name:" + e.sni : ""
                      },skip-cert-verify:${e["skip-cert-verify"] || "false"}`),
                    `${e.name}=vmess,${e.server},${e.port},${
                      "auto" === e.cipher ? "none" : e.cipher
                    },"${e.uuid}",over-tls:${e.tls || "false"}${t}`
                  );
                case "trojan":
                  return `${e.name}=trojan,${e.server},${e.port},"${
                    e.password
                  }"${e.sni ? ",tls-name:" + e.sni : ""},skip-cert-verify:${
                    e["skip-cert-verify"] || "false"
                  }`;
                case "http":
                  s = "";
                  const o = `${e.name}=${e.tls ? "http" : "https"},${
                    e.server
                  },${e.port},${e.username || ""},${e.password || ""}`;
                  return e.tls
                    ? o +
                        (s = `${
                          e.sni ? ",tls-name:" + e.sni : ""
                        },skip-cert-verify:${e["skip-cert-verify"]}`)
                    : o;
              }
              throw new Error(
                `Platform Loon does not support proxy type: ${e.type}`
              );
            },
          },
          Clash: {
            type: "ALL",
            produce: (e) =>
              "proxies:\n" +
              e
                .map(
                  (e) => (delete e.supported, "  - " + JSON.stringify(e) + "\n")
                )
                .join(""),
          },
          URI: {
            type: "SINGLE",
            produce: (e) => {
              let t = "";
              switch (e.type) {
                case "ss":
                  const s = `${e.cipher}:${e.password}`;
                  if (
                    ((t = `ss://${Base64.safeEncode(s)}@${e.server}:${
                      e.port
                    }/`),
                    e.plugin)
                  ) {
                    t += "?plugin=";
                    const s = e["plugin-opts"];
                    switch (e.plugin) {
                      case "obfs":
                        t += encodeURIComponent(
                          `simple-obfs;obfs=${s.mode}${
                            s.host ? ";obfs-host=" + s.host : ""
                          }`
                        );
                        break;
                      case "v2ray-plugin":
                        t += encodeURIComponent(
                          `v2ray-plugin;obfs=${s.mode}${
                            s.host ? ";obfs-host" + s.host : ""
                          }${s.tls ? ";tls" : ""}`
                        );
                        break;
                      default:
                        throw new Error(
                          `Unsupported plugin option: ${e.plugin}`
                        );
                    }
                  }
                  t += `#${encodeURIComponent(e.name)}`;
                  break;
                case "ssr":
                  (t = `${e.server}:${e.port}:${e.protocol}:${e.cipher}:${
                    e.obfs
                  }:${Base64.safeEncode(e.password)}/`),
                    (t += `?remarks=${Base64.safeEncode(e.name)}${
                      e["obfs-param"]
                        ? "&obfsparam=" + Base64.safeEncode(e["obfs-param"])
                        : ""
                    }${
                      e["protocol-param"]
                        ? "&protocolparam=" +
                          Base64.safeEncode(e["protocol-param"])
                        : ""
                    }`),
                    (t = "ssr://" + Base64.safeEncode(t));
                  break;
                case "vmess":
                  (t = {
                    ps: e.name,
                    add: e.server,
                    port: e.port,
                    id: e.uuid,
                    type: "",
                    aid: 0,
                    net: e.network || "tcp",
                    tls: e.tls ? "tls" : "",
                  }),
                    "ws" === e.network &&
                      ((t.path = e["ws-path"] || "/"),
                      (t.host = e["ws-headers"].Host || e.server)),
                    (t = "vmess://" + Base64.safeEncode(JSON.stringify(t)));
                  break;
                case "trojan":
                  t = `trojan://${e.password}@${e.server}:${
                    e.port
                  }#${encodeURIComponent(e.name)}`;
                  break;
                default:
                  throw new Error(`Cannot handle proxy type: ${e.type}`);
              }
              return t;
            },
          },
          JSON: { type: "ALL", produce: (e) => JSON.stringify(e, null, 2) },
        };
      })();
    function preprocess(e) {
      for (const t of PROXY_PREPROCESSORS)
        try {
          if (t.test(e))
            return $.info(`Pre-processor [${t.name}] activated`), t.parse(e);
        } catch (e) {
          $.error(`Parser [${t.name}] failed\n Reason: ${e}`);
        }
      return e;
    }
    function safeMatch(e, t) {
      let s;
      try {
        s = e.test(t);
      } catch (e) {
        s = !1;
      }
      return s;
    }
    function parse(e) {
      const t = (e = preprocess(e)).split("\n"),
        s = [];
      let r;
      for (let e of t) {
        if (0 === (e = e.trim()).length) continue;
        let t = r && safeMatch(r, e);
        if (!t)
          for (const s of PROXY_PARSERS)
            if (safeMatch(s, e)) {
              (r = s), (t = !0), $.info(`Proxy parser: ${s.name} is activated`);
              break;
            }
        if (t)
          try {
            const t = r.parse(e);
            t || $.error(`Parser ${r.name} return nothing for \n${e}\n`),
              s.push(t);
          } catch (t) {
            $.error(`Failed to parse line: \n ${e}\n Reason: ${t.stack}`);
          }
        else $.error(`Failed to find a rule to parse line: \n${e}\n`);
      }
      return s;
    }
    async function process(e, t = []) {
      for (const s of t) {
        let t, r;
        if (-1 !== s.type.indexOf("Script")) {
          const { mode: e, content: r } = s.args;
          if ("link" === e)
            try {
              t = await $.http.get(r).then((e) => e.body);
            } catch (e) {
              $.error(
                `Error when downloading remote script: ${s.args.content}.\n Reason: ${e}`
              );
              continue;
            }
          else t = r;
        }
        PROXY_PROCESSORS[s.type]
          ? ($.info(
              `Applying "${s.type}" with arguments:\n >>> ${
                JSON.stringify(s.args, null, 2) || "None"
              }`
            ),
            (e = ApplyProcessor(
              (r =
                -1 !== s.type.indexOf("Script")
                  ? PROXY_PROCESSORS[s.type](t)
                  : PROXY_PROCESSORS[s.type](s.args)),
              e
            )))
          : $.error(`Unknown operator: "${s.type}"`);
      }
      return e;
    }
    function produce(e, t) {
      const s = PROXY_PRODUCERS[t];
      if (!s) throw new Error(`Target platform: ${t} is not supported!`);
      return (
        (e = e.filter((e) => !(e.supported && !1 === e.supported[t]))),
        $.info(`Producing proxies for target: ${t}`),
        void 0 === s.type || "SINGLE" === s.type
          ? e
              .map((e) => {
                try {
                  return s.produce(e);
                } catch (t) {
                  return (
                    $.error(
                      `Cannot produce proxy: ${JSON.stringify(
                        e,
                        null,
                        2
                      )}\nReason: ${t}`
                    ),
                    ""
                  );
                }
              })
              .filter((e) => e.length > 0)
              .join("\n")
          : "ALL" === s.type
          ? s.produce(e)
          : void 0
      );
    }
    return { parse: parse, process: process, produce: produce };
  })(),
  RuleUtils = (function () {
    const e = [
        [/^(DOMAIN|host|HOST)$/, "DOMAIN"],
        [/^(DOMAIN-KEYWORD|host-keyword|HOST-KEYWORD)$/, "DOMAIN-KEYWORD"],
        [/^(DOMAIN-SUFFIX|host-suffix|HOST-SUFFIX)$/, "DOMAIN-SUFFIX"],
        [/^USER-AGENT$/i, "USER-AGENT"],
        [/^PROCESS-NAME$/, "PROCESS-NAME"],
        [/^(DEST-PORT|DST-PORT)$/, "DST-PORT"],
        [/^SRC-IP(-CIDR)?$/, "SRC-IP"],
        [/^(IN|SRC)-PORT$/, "IN-PORT"],
        [/^PROTOCOL$/, "PROTOCOL"],
        [/^IP-CIDR$/i, "IP-CIDR"],
        [/^(IP-CIDR6|ip6-cidr|IP6-CIDR)$/],
      ],
      t = (function () {
        return [
          {
            name: "HTML",
            test: (e) => /^<!DOCTYPE html>/.test(e),
            parse: (e) => "",
          },
          {
            name: "Clash Provider",
            test: (e) => 0 === e.indexOf("payload:"),
            parse: (e) => e.replace("payload:", "").replace(/^\s*-\s*/gm, ""),
          },
        ];
      })(),
      s = (function () {
        return [
          {
            name: "Universal Rule Parser",
            test: () => !0,
            parse: (t) => {
              const s = t.split("\n"),
                r = [];
              for (let t of s)
                if (0 !== (t = t.trim()).length && !/\s*#/.test(t))
                  try {
                    const s = t.split(",").map((e) => e.trim());
                    let n = s[0],
                      o = !1;
                    for (const t of e)
                      if (t[0].test(n)) {
                        o = !0;
                        const e = { type: t[1], content: s[1] };
                        ("IP-CIDR" !== e.type && "IP-CIDR6" !== e.type) ||
                          (e.options = s.slice(2)),
                          r.push(e);
                      }
                    if (!o) throw new Error("Invalid rule type: " + n);
                  } catch (e) {
                    console.error(`Failed to parse line: ${t}\n Reason: ${e}`);
                  }
              return r;
            },
          },
        ];
      })(),
      r = (function () {
        return {
          "Regex Filter": function ({ regex: e = [], keep: t = !0 }) {
            return {
              name: "Regex Filter",
              func: (s) =>
                s.map((s) => {
                  const r = e.some((e) => (e = new RegExp(e)).test(s));
                  return t ? r : !r;
                }),
            };
          },
          "Remove Duplicate Filter": function () {
            return {
              name: "Remove Duplicate Filter",
              func: (e) => {
                const t = new Set(),
                  s = [];
                return (
                  e.forEach((e) => {
                    const r = e.options || [];
                    r.sort();
                    const n = `${e.type},${e.content},${JSON.stringify(r)}`;
                    t.has(n) || (s.push(e), t.add(n));
                  }),
                  s
                );
              },
            };
          },
          "Type Filter": function (e) {
            return {
              name: "Type Filter",
              func: (t) => t.map((t) => e.some((e) => t.type === e)),
            };
          },
          "Regex Replace Operator": function (e) {
            return {
              name: "Regex Rename Operator",
              func: (t) =>
                t.map((t) => {
                  for (const { expr: s, now: r } of e)
                    t.content = t.content.replace(new RegExp(s, "g"), r).trim();
                  return t;
                }),
            };
          },
        };
      })(),
      n = (function () {
        return {
          QX: {
            type: "SINGLE",
            func: (e) =>
              -1 !==
              [
                "URL-REGEX",
                "DEST-PORT",
                "SRC-IP",
                "IN-PORT",
                "PROTOCOL",
              ].indexOf(e.type)
                ? null
                : `${
                    {
                      "DOMAIN-KEYWORD": "HOST-KEYWORD",
                      "DOMAIN-SUFFIX": "HOST-SUFFIX",
                      DOMAIN: "HOST",
                      "IP-CIDR6": "IP6-CIDR",
                    }[e.type] || e.type
                  },${e.content},SUB-STORE`,
          },
          Surge: {
            type: "SINGLE",
            func: (e) => {
              let t = `${e.type},${e.content}`;
              return (
                ("IP-CIDR" !== e.type && "IP-CIDR6" !== e.type) ||
                  (t += e.options ? `,${e.options[0]}` : ""),
                t
              );
            },
          },
          Loon: {
            type: "SINGLE",
            func: (e) =>
              -1 !==
              ["DEST-PORT", "SRC-IP", "IN-PORT", "PROTOCOL"].indexOf(e.type)
                ? null
                : ((e) => {
                    let t = `${e.type},${e.content}`;
                    return (
                      ("IP-CIDR" !== e.type && "IP-CIDR6" !== e.type) ||
                        (t += e.options ? `,${e.options[0]}` : ""),
                      t
                    );
                  })(e),
          },
          Clash: {
            type: "ALL",
            func: (e) => {
              const t = {
                  "DEST-PORT": "DST-PORT",
                  "SRC-IP": "SRC-IP-CIDR",
                  "IN-PORT": "SRC-PORT",
                },
                s = {
                  payload: e.map((e) => {
                    let s = `${t[e.type] || e.type},${e.content}`;
                    return (
                      ("IP-CIDR" !== e.type && "IP-CIDR6" !== e.type) ||
                        (s += e.options ? `,${e.options[0]}` : ""),
                      s
                    );
                  }),
                };
              return YAML.stringify(s);
            },
          },
        };
      })();
    return {
      parse: function (e) {
        e = (function (e) {
          for (const s of t)
            try {
              if (s.test(e))
                return (
                  $.info(`Pre-processor [${s.name}] activated`), s.parse(e)
                );
            } catch (e) {
              $.error(`Parser [${s.name}] failed\n Reason: ${e}`);
            }
          return e;
        })(e);
        for (const t of s) {
          let s;
          try {
            s = t.test(e);
          } catch (e) {
            s = !1;
          }
          if (s)
            return $.info(`Rule parser [${t.name}] is activated!`), t.parse(e);
        }
      },
      process: async function (e, t) {
        for (const s of t) {
          if (!r[s.type]) {
            console.error(`Unknown operator: ${s.type}!`);
            continue;
          }
          const t = r[s.type](s.args);
          $.info(
            `Applying "${s.type}" with arguments: \n >>> ${
              JSON.stringify(s.args) || "None"
            }`
          ),
            (e = ApplyProcessor(t, e));
        }
        return e;
      },
      produce: function (e, t) {
        const s = n[t];
        if (!s) throw new Error(`Target platform: ${t} is not supported!`);
        return void 0 === s.type || "SINGLE" === s.type
          ? e
              .map((e) => {
                try {
                  return s.func(e);
                } catch (t) {
                  return (
                    console.log(
                      `ERROR: cannot produce rule: ${JSON.stringify(
                        e
                      )}\nReason: ${t}`
                    ),
                    ""
                  );
                }
              })
              .filter((e) => e.length > 0)
              .join("\n")
          : "ALL" === s.type
          ? s.func(e)
          : void 0;
      },
    };
  })();
function getBuiltInRules() {
  return {
    AD: {
      name: "AD",
      description: "",
      urls: [
        "https://raw.githubusercontent.com/privacy-protection-tools/anti-AD/master/anti-ad-surge.txt",
        "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Providers/BanAD.yaml",
      ],
    },
    Global: {
      name: "Global",
      description: "",
      urls: [
        "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Providers/ProxyGFWlist.yaml",
        "https://raw.githubusercontent.com/DivineEngine/Profiles/master/Quantumult/Filter/Global.list",
      ],
    },
    CN: {
      name: "CN",
      description: "",
      urls: [
        "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Providers/ChinaDomain.yaml",
        "https://raw.githubusercontent.com/DivineEngine/Profiles/master/Quantumult/Filter/China.list",
      ],
    },
  };
}
function ApplyProcessor(e, t) {
  return -1 !== e.name.indexOf("Filter")
    ? (function (e, t) {
        let s = FULL(t.length, !0);
        try {
          s = AND(s, e.func(t));
        } catch (t) {
          console.log(`Cannot apply filter ${e.name}\n Reason: ${t}`);
        }
        return t.filter((e, t) => s[t]);
      })(e, t)
    : -1 !== e.name.indexOf("Operator")
    ? (function (e, t) {
        let s = clone(t);
        try {
          const t = e.func(s);
          t && (s = t);
        } catch (t) {
          console.log(`Cannot apply operator ${e.name}! Reason: ${t}`);
        }
        return s;
      })(e, t)
    : void 0;
}
function AND(...e) {
  return e.reduce((e, t) => e.map((e, s) => t[s] && e));
}
function OR(...e) {
  return e.reduce((e, t) => e.map((e, s) => t[s] || e));
}
function NOT(e) {
  return e.map((e) => !e);
}
function FULL(e, t) {
  return [...Array(e).keys()].map(() => t);
}
function clone(e) {
  return JSON.parse(JSON.stringify(e));
}
function buildRegex(e, ...t) {
  return (
    (t = t.join("")),
    e.startsWith("(?i)")
      ? ((e = e.substr(4)), new RegExp(e, "i" + t))
      : new RegExp(e, t)
  );
}
function ENV() {
  const e = "undefined" != typeof $task,
    t = "undefined" != typeof $loon,
    s = "undefined" != typeof $httpClient && !t,
    r = "function" == typeof require && "undefined" != typeof $jsbox;
  return {
    isQX: e,
    isLoon: t,
    isSurge: s,
    isNode: "function" == typeof require && !r,
    isJSBox: r,
    isRequest: "undefined" != typeof $request,
    isScriptable: "undefined" != typeof importModule,
  };
}
function HTTP(e = { baseURL: "" }) {
  const { isQX: t, isLoon: s, isSurge: r, isScriptable: n, isNode: o } = ENV(),
    a =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;
  const i = {};
  return (
    ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].forEach(
      (p) =>
        (i[p.toLowerCase()] = (i) =>
          (function (i, p) {
            p = "string" == typeof p ? { url: p } : p;
            const c = e.baseURL;
            c && !a.test(p.url || "") && (p.url = c ? c + p.url : p.url);
            const u = (p = { ...e, ...p }).timeout,
              l = {
                onRequest: () => {},
                onResponse: (e) => e,
                onTimeout: () => {},
                ...p.events,
              };
            let f, d;
            if ((l.onRequest(i, p), t))
              f = $task.fetch({
                method: i,
                url: p.url,
                headers: p.headers,
                body: p.body,
              });
            else if (s || r || o)
              f = new Promise((e, t) => {
                (o ? require("request") : $httpClient)[i.toLowerCase()](
                  p,
                  (s, r, n) => {
                    s
                      ? t(s)
                      : e({
                          statusCode: r.status || r.statusCode,
                          headers: r.headers,
                          body: n,
                        });
                  }
                );
              });
            else if (n) {
              const e = new Request(p.url);
              (e.method = i),
                (e.headers = p.headers),
                (e.body = p.body),
                (f = new Promise((t, s) => {
                  e.loadString()
                    .then((s) => {
                      t({
                        statusCode: e.response.statusCode,
                        headers: e.response.headers,
                        body: s,
                      });
                    })
                    .catch((e) => s(e));
                }));
            }
            const h = u
              ? new Promise((e, t) => {
                  d = setTimeout(
                    () => (
                      l.onTimeout(),
                      t(`${i} URL: ${p.url} exceeds the timeout ${u} ms`)
                    ),
                    u
                  );
                })
              : null;
            return (
              h ? Promise.race([h, f]).then((e) => (clearTimeout(d), e)) : f
            ).then((e) => l.onResponse(e));
          })(p, i))
    ),
    i
  );
}
function API(e = "untitled", t = !1) {
  const {
    isQX: s,
    isLoon: r,
    isSurge: n,
    isNode: o,
    isJSBox: a,
    isScriptable: i,
  } = ENV();
  return new (class {
    constructor(e, t) {
      (this.name = e),
        (this.debug = t),
        (this.http = HTTP()),
        (this.env = ENV()),
        (this.node = (() => {
          if (o) {
            return { fs: require("fs") };
          }
          return null;
        })()),
        this.initCache();
      Promise.prototype.delay = function (e) {
        return this.then(function (t) {
          return ((e, t) =>
            new Promise(function (s) {
              setTimeout(s.bind(null, t), e);
            }))(e, t);
        });
      };
    }
    initCache() {
      if (
        (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}")),
        (r || n) &&
          (this.cache = JSON.parse($persistentStore.read(this.name) || "{}")),
        o)
      ) {
        let e = "root.json";
        this.node.fs.existsSync(e) ||
          this.node.fs.writeFileSync(
            e,
            JSON.stringify({}),
            { flag: "wx" },
            (e) => console.log(e)
          ),
          (this.root = {}),
          (e = `${this.name}.json`),
          this.node.fs.existsSync(e)
            ? (this.cache = JSON.parse(
                this.node.fs.readFileSync(`${this.name}.json`)
              ))
            : (this.node.fs.writeFileSync(
                e,
                JSON.stringify({}),
                { flag: "wx" },
                (e) => console.log(e)
              ),
              (this.cache = {}));
      }
    }
    persistCache() {
      const e = JSON.stringify(this.cache, null, 2);
      s && $prefs.setValueForKey(e, this.name),
        (r || n) && $persistentStore.write(e, this.name),
        o &&
          (this.node.fs.writeFileSync(
            `${this.name}.json`,
            e,
            { flag: "w" },
            (e) => console.log(e)
          ),
          this.node.fs.writeFileSync(
            "root.json",
            JSON.stringify(this.root, null, 2),
            { flag: "w" },
            (e) => console.log(e)
          ));
    }
    write(e, t) {
      if ((this.log(`SET ${t}`), -1 !== t.indexOf("#"))) {
        if (((t = t.substr(1)), n || r)) return $persistentStore.write(e, t);
        if (s) return $prefs.setValueForKey(e, t);
        o && (this.root[t] = e);
      } else this.cache[t] = e;
      this.persistCache();
    }
    read(e) {
      return (
        this.log(`READ ${e}`),
        -1 === e.indexOf("#")
          ? this.cache[e]
          : ((e = e.substr(1)),
            n || r
              ? $persistentStore.read(e)
              : s
              ? $prefs.valueForKey(e)
              : o
              ? this.root[e]
              : void 0)
      );
    }
    delete(e) {
      if ((this.log(`DELETE ${e}`), -1 !== e.indexOf("#"))) {
        if (((e = e.substr(1)), n || r)) return $persistentStore.write(null, e);
        if (s) return $prefs.removeValueForKey(e);
        o && delete this.root[e];
      } else delete this.cache[e];
      this.persistCache();
    }
    notify(e, t = "", p = "", c = {}) {
      const u = c["open-url"],
        l = c["media-url"];
      if (
        (s && $notify(e, t, p, c),
        n &&
          $notification.post(e, t, p + `${l ? "\n多媒体:" + l : ""}`, {
            url: u,
          }),
        r)
      ) {
        let s = {};
        u && (s.openUrl = u),
          l && (s.mediaUrl = l),
          "{}" === JSON.stringify(s)
            ? $notification.post(e, t, p)
            : $notification.post(e, t, p, s);
      }
      if (o || i) {
        const s =
          p + (u ? `\n点击跳转: ${u}` : "") + (l ? `\n多媒体: ${l}` : "");
        if (a) {
          require("push").schedule({ title: e, body: (t ? t + "\n" : "") + s });
        } else console.log(`${e}\n${t}\n${s}\n\n`);
      }
    }
    log(e) {
      this.debug && console.log(`[${this.name}] LOG: ${e}`);
    }
    info(e) {
      console.log(`[${this.name}] INFO: ${e}`);
    }
    error(e) {
      console.log(`[${this.name}] ERROR: ${e}`);
    }
    wait(e) {
      return new Promise((t) => setTimeout(t, e));
    }
    done(e = {}) {
      s || r || n
        ? $done(e)
        : o &&
          !a &&
          "undefined" != typeof $context &&
          (($context.headers = e.headers),
          ($context.statusCode = e.statusCode),
          ($context.body = e.body));
    }
  })(e, t);
}
function Gist({ token: e, key: t }) {
  const s = HTTP({
    baseURL: "https://api.github.com",
    headers: {
      Authorization: `token ${e}`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
    },
    events: {
      onResponse: (e) =>
        /^[45]/.test(String(e.statusCode))
          ? Promise.reject(`ERROR: ${JSON.parse(e.body).message}`)
          : e,
    },
  });
  async function r() {
    return s.get("/gists").then((e) => {
      const s = JSON.parse(e.body);
      for (let e of s) if (e.description === t) return e.id;
      return -1;
    });
  }
  (this.upload = async function ({ filename: e, content: n }) {
    const o = await r(),
      a = { [e]: { content: n } };
    return -1 === o
      ? s.post({
          url: "/gists",
          body: JSON.stringify({ description: t, public: !1, files: a }),
        })
      : s.patch({ url: `/gists/${o}`, body: JSON.stringify({ files: a }) });
  }),
    (this.download = async function (e) {
      const t = await r();
      if (-1 === t) return Promise.reject("未找到Gist备份！");
      try {
        const { files: r } = await s
            .get(`/gists/${t}`)
            .then((e) => JSON.parse(e.body)),
          n = r[e].raw_url;
        return await s.get(n).then((e) => e.body);
      } catch (e) {
        return Promise.reject(e);
      }
    });
}
function express({ port: e } = { port: 3e3 }) {
  const { isNode: t } = ENV(),
    s = {
      "Content-Type": "text/plain;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,GET,OPTIONS,PATCH,PUT,DELETE",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
    };
  if (t) {
    const t = require("express"),
      r = require("body-parser"),
      n = t();
    return (
      n.use(r.json({ verify: i })),
      n.use(r.urlencoded({ verify: i, extended: !0 })),
      n.use(r.raw({ verify: i, type: "*/*" })),
      n.use((e, t, r) => {
        t.set(s), r();
      }),
      (n.start = () => {
        n.listen(e, () => {
          $.log(`Express started on port: ${e}`);
        });
      }),
      n
    );
  }
  const r = [],
    n = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD'", "ALL"],
    o = (e, t = 0) => {
      let { method: s, url: n, headers: a, body: i } = e;
      /json/i.test(a["Content-Type"]) && (i = JSON.parse(i)),
        (s = s.toUpperCase());
      const { path: l, query: f } = (function (e) {
        const t = (e.match(/https?:\/\/[^\/]+(\/[^?]*)/) || [])[1] || "/",
          s = e.indexOf("?"),
          r = {};
        if (-1 !== s) {
          let t = e.slice(e.indexOf("?") + 1).split("&");
          for (let e = 0; e < t.length; e++)
            (hash = t[e].split("=")), (r[hash[0]] = hash[1]);
        }
        return { path: t, query: r };
      })(n);
      let d,
        h = null,
        m = 0;
      for (d = t; d < r.length; d++)
        if ("ALL" === r[d].method || s === r[d].method) {
          const { pattern: e } = r[d];
          c(e, l) &&
            e.split("/").length > m &&
            ((h = r[d]), (m = e.split("/").length));
        }
      if (h) {
        const e = () => {
            o(s, n, d);
          },
          t = {
            method: s,
            url: n,
            path: l,
            query: f,
            params: u(h.pattern, l),
            headers: a,
            body: i,
          },
          r = p(),
          c = h.callback,
          m = (e) => {
            r.status(500).json({
              status: "failed",
              message: `Internal Server Error: ${e}`,
            });
          };
        if ("AsyncFunction" === c.constructor.name) c(t, r, e).catch(m);
        else
          try {
            c(t, r, e);
          } catch (e) {
            m(e);
          }
      } else {
        p()
          .status(404)
          .json({ status: "failed", message: "ERROR: 404 not found" });
      }
    },
    a = {};
  return (
    n.forEach((e) => {
      a[e.toLowerCase()] = (t, s) => {
        r.push({ method: e, pattern: t, callback: s });
      };
    }),
    (a.route = (e) => {
      const t = {};
      return (
        n.forEach((s) => {
          t[s.toLowerCase()] = (n) => (
            r.push({ method: s, pattern: e, callback: n }), t
          );
        }),
        t
      );
    }),
    (a.start = () => {
      o($request);
    }),
    a
  );
  function i(e, t, s, r) {
    s && s.length && (e.rawBody = s.toString(r || "utf8"));
  }
  function p() {
    let e = 200;
    const { isQX: t, isLoon: r, isSurge: n } = ENV(),
      o = s,
      a = {
        200: "HTTP/1.1 200 OK",
        201: "HTTP/1.1 201 Created",
        302: "HTTP/1.1 302 Found",
        307: "HTTP/1.1 307 Temporary Redirect",
        308: "HTTP/1.1 308 Permanent Redirect",
        404: "HTTP/1.1 404 Not Found",
        500: "HTTP/1.1 500 Internal Server Error",
      };
    return new (class {
      status(t) {
        return (e = t), this;
      }
      send(s = "") {
        const i = { status: t ? a[e] : e, body: s, headers: o };
        t ? $done(i) : (r || n) && $done({ response: i });
      }
      end() {
        this.send();
      }
      html(e) {
        this.set("Content-Type", "text/html;charset=UTF-8"), this.send(e);
      }
      json(e) {
        this.set("Content-Type", "application/json;charset=UTF-8"),
          this.send(JSON.stringify(e));
      }
      set(e, t) {
        return (o[e] = t), this;
      }
    })();
  }
  function c(e, t) {
    if (e instanceof RegExp && e.test(t)) return !0;
    if ("/" === e) return !0;
    if (-1 === e.indexOf(":")) {
      const s = t.split("/"),
        r = e.split("/");
      for (let e = 0; e < r.length; e++) if (s[e] !== r[e]) return !1;
      return !0;
    }
    return !!u(e, t);
  }
  function u(e, t) {
    if (-1 === e.indexOf(":")) return null;
    {
      const s = {};
      for (let r = 0, n = 0; r < e.length; r++, n++)
        if (":" === e[r]) {
          let o = [],
            a = [];
          for (; "/" !== e[++r] && r < e.length; ) o.push(e[r]);
          for (; "/" !== t[n] && n < t.length; ) a.push(t[n++]);
          s[o.join("")] = a.join("");
        } else if (e[r] !== t[n]) return null;
      return s;
    }
  }
}
function Base64Code() {
  const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    t = (function (e) {
      const t = {};
      let s = 0;
      const r = e.length;
      for (; s < r; s++) t[e.charAt(s)] = s;
      return t;
    })(e),
    s = String.fromCharCode,
    r = function (e) {
      let t;
      return e.length < 2
        ? (t = e.charCodeAt(0)) < 128
          ? e
          : t < 2048
          ? s(192 | (t >>> 6)) + s(128 | (63 & t))
          : s(224 | ((t >>> 12) & 15)) +
            s(128 | ((t >>> 6) & 63)) +
            s(128 | (63 & t))
        : ((t =
            65536 +
            1024 * (e.charCodeAt(0) - 55296) +
            (e.charCodeAt(1) - 56320)),
          s(240 | ((t >>> 18) & 7)) +
            s(128 | ((t >>> 12) & 63)) +
            s(128 | ((t >>> 6) & 63)) +
            s(128 | (63 & t)));
    },
    n = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g,
    o = function (t) {
      const s = [0, 2, 1][t.length % 3],
        r =
          (t.charCodeAt(0) << 16) |
          ((t.length > 1 ? t.charCodeAt(1) : 0) << 8) |
          (t.length > 2 ? t.charCodeAt(2) : 0);
      return [
        e.charAt(r >>> 18),
        e.charAt((r >>> 12) & 63),
        s >= 2 ? "=" : e.charAt((r >>> 6) & 63),
        s >= 1 ? "=" : e.charAt(63 & r),
      ].join("");
    };
  this.encode = function (e) {
    return "[object Uint8Array]" === Object.prototype.toString.call(e)
      ? e.toString("base64")
      : (function (e) {
          return e.replace(n, r);
        })(String(e)).replace(/[\s\S]{1,3}/g, o);
  };
  const a =
      /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g,
    i = function (e) {
      switch (e.length) {
        case 4:
          const t =
            (((7 & e.charCodeAt(0)) << 18) |
              ((63 & e.charCodeAt(1)) << 12) |
              ((63 & e.charCodeAt(2)) << 6) |
              (63 & e.charCodeAt(3))) -
            65536;
          return s(55296 + (t >>> 10)) + s(56320 + (1023 & t));
        case 3:
          return s(
            ((15 & e.charCodeAt(0)) << 12) |
              ((63 & e.charCodeAt(1)) << 6) |
              (63 & e.charCodeAt(2))
          );
        default:
          return s(((31 & e.charCodeAt(0)) << 6) | (63 & e.charCodeAt(1)));
      }
    },
    p = function (e) {
      const r = e.length,
        n = r % 4,
        o =
          (r > 0 ? t[e.charAt(0)] << 18 : 0) |
          (r > 1 ? t[e.charAt(1)] << 12 : 0) |
          (r > 2 ? t[e.charAt(2)] << 6 : 0) |
          (r > 3 ? t[e.charAt(3)] : 0),
        a = [s(o >>> 16), s((o >>> 8) & 255), s(255 & o)];
      return (a.length -= [0, 0, 2, 1][n]), a.join("");
    },
    c = function (e) {
      return e.replace(/\S{1,4}/g, p);
    },
    u = function (e) {
      return c(e).replace(a, i);
    };
  (this.decode = function (e) {
    return u(
      String(e)
        .replace(/[-_]/g, function (e) {
          return "-" === e ? "+" : "/";
        })
        .replace(/[^A-Za-z0-9\+\/]/g, "")
    )
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<");
  }),
    (this.safeEncode = function (e) {
      return this.encode(e.replace(/\+/g, "-").replace(/\//g, "_"));
    }),
    (this.safeDecode = function (e) {
      return this.decode(e.replace(/-/g, "+").replace(/_/g, "/"));
    });
}
var YAML = (function () {
  var e = [],
    t = [],
    s = 0,
    r = {
      regLevel: new RegExp("^([\\s\\-]+)"),
      invalidLine: new RegExp("^\\-\\-\\-|^\\.\\.\\.|^\\s*#.*|^\\s*$"),
      dashesString: new RegExp('^\\s*\\"([^\\"]*)\\"\\s*$'),
      quotesString: new RegExp("^\\s*\\'([^\\']*)\\'\\s*$"),
      float: new RegExp("^[+-]?[0-9]+\\.[0-9]+(e[+-]?[0-9]+(\\.[0-9]+)?)?$"),
      integer: new RegExp("^[+-]?[0-9]+$"),
      array: new RegExp("\\[\\s*(.*)\\s*\\]"),
      map: new RegExp("\\{\\s*(.*)\\s*\\}"),
      key_value: new RegExp("([a-z0-9_-][ a-z0-9_-]*):( .+)", "i"),
      single_key_value: new RegExp("^([a-z0-9_-][ a-z0-9_-]*):( .+?)$", "i"),
      key: new RegExp("([a-z0-9_-][ a-z0-9_-]*):( .+)?", "i"),
      item: new RegExp("^-\\s+"),
      trim: new RegExp("^\\s+|\\s+$"),
      comment: new RegExp(
        "([^\\'\\\"#]+([\\'\\\"][^\\'\\\"]*[\\'\\\"])*)*(#.*)?"
      ),
    };
  function n(e) {
    return {
      parent: null,
      length: 0,
      level: e,
      lines: [],
      children: [],
      addChild: function (e) {
        this.children.push(e), (e.parent = this), ++this.length;
      },
    };
  }
  function o(e) {
    var t = null;
    if ("true" == (e = e.replace(r.trim, ""))) return !0;
    if ("false" == e) return !1;
    if (".NaN" == e) return Number.NaN;
    if ("null" == e) return null;
    if (".inf" == e) return Number.POSITIVE_INFINITY;
    if ("-.inf" == e) return Number.NEGATIVE_INFINITY;
    if ((t = e.match(r.dashesString))) return t[1];
    if ((t = e.match(r.quotesString))) return t[1];
    if ((t = e.match(r.float))) return parseFloat(t[0]);
    if ((t = e.match(r.integer))) return parseInt(t[0]);
    if (isNaN((t = Date.parse(e)))) {
      if ((t = e.match(r.single_key_value)))
        return ((a = {})[t[1]] = o(t[2])), a;
      if ((t = e.match(r.array))) {
        for (
          var s = 0, n = " ", a = [], i = "", p = !1, c = 0, u = t[1].length;
          c < u;
          ++c
        ) {
          if ("'" == (n = t[1][c]) || '"' == n) {
            if (!1 === p) {
              (p = n), (i += n);
              continue;
            }
            if (("'" == n && "'" == p) || ('"' == n && '"' == p)) {
              (p = !1), (i += n);
              continue;
            }
          } else if (!1 !== p || ("[" != n && "{" != n))
            if (!1 !== p || ("]" != n && "}" != n)) {
              if (!1 === p && 0 == s && "," == n) {
                a.push(o(i)), (i = "");
                continue;
              }
            } else --s;
          else ++s;
          i += n;
        }
        return i.length > 0 && a.push(o(i)), a;
      }
      if ((t = e.match(r.map))) {
        for (
          s = 0, n = " ", a = [], i = "", p = !1, c = 0, u = t[1].length;
          c < u;
          ++c
        ) {
          if ("'" == (n = t[1][c]) || '"' == n) {
            if (!1 === p) {
              (p = n), (i += n);
              continue;
            }
            if (("'" == n && "'" == p) || ('"' == n && '"' == p)) {
              (p = !1), (i += n);
              continue;
            }
          } else if (!1 !== p || ("[" != n && "{" != n))
            if (!1 !== p || ("]" != n && "}" != n)) {
              if (!1 === p && 0 == s && "," == n) {
                a.push(i), (i = "");
                continue;
              }
            } else --s;
          else ++s;
          i += n;
        }
        i.length > 0 && a.push(i);
        var l = {};
        for (c = 0, u = a.length; c < u; ++c)
          (t = a[c].match(r.key_value)) && (l[t[1]] = o(t[2]));
        return l;
      }
      return e;
    }
    return new Date(t);
  }
  function a(e) {
    for (
      var t = e.lines, s = e.children, r = [t.join(" ")], n = 0, o = s.length;
      n < o;
      ++n
    )
      r.push(a(s[n]));
    return r.join("\n");
  }
  function i(e) {
    for (
      var t = e.lines, s = e.children, r = t.join("\n"), n = 0, o = s.length;
      n < o;
      ++n
    )
      r += i(s[n]);
    return r;
  }
  function p(s) {
    return (function s(n) {
      for (
        var p = null,
          c = {},
          u = null,
          l = null,
          f = null,
          d = -1,
          h = [],
          m = !0,
          $ = 0,
          g = n.length;
        $ < g;
        ++$
      )
        if (-1 == d || d == n[$].level) {
          h.push($),
            (d = n[$].level),
            (u = n[$].lines),
            (l = n[$].children),
            (f = null);
          for (var y = 0, w = u.length; y < w; ++y) {
            var S = u[y];
            if ((p = S.match(r.key))) {
              var v = p[1];
              if (
                ("-" == v[0] &&
                  ((v = v.replace(r.item, "")),
                  m && ((m = !1), void 0 === c.length && (c = [])),
                  null != f && c.push(f),
                  (f = {}),
                  (m = !0)),
                void 0 !== p[2])
              ) {
                var O = p[2].replace(r.trim, "");
                if ("&" == O[0]) {
                  var R = s(l);
                  null != f ? (f[v] = R) : (c[v] = R), (t[O.substr(1)] = R);
                } else if ("|" == O[0])
                  null != f ? (f[v] = i(l.shift())) : (c[v] = i(l.shift()));
                else if ("*" == O[0]) {
                  var b = O.substr(1),
                    P = {};
                  if (void 0 === t[b])
                    e.push("Reference '" + b + "' not found!");
                  else {
                    for (var x in t[b]) P[x] = t[b][x];
                    null != f ? (f[v] = P) : (c[v] = P);
                  }
                } else
                  ">" == O[0]
                    ? null != f
                      ? (f[v] = a(l.shift()))
                      : (c[v] = a(l.shift()))
                    : null != f
                    ? (f[v] = o(O))
                    : (c[v] = o(O));
              } else null != f ? (f[v] = s(l)) : (c[v] = s(l));
            } else
              S.match(/^-\s*$/)
                ? (m && ((m = !1), void 0 === c.length && (c = [])),
                  null != f && c.push(f),
                  (f = {}),
                  (m = !0))
                : (p = S.match(/^-\s*(.*)/)) &&
                  (null != f
                    ? f.push(o(p[1]))
                    : (m && ((m = !1), void 0 === c.length && (c = [])),
                      c.push(o(p[1]))));
          }
          null != f &&
            (m && ((m = !1), void 0 === c.length && (c = [])), c.push(f));
        }
      for ($ = h.length - 1; $ >= 0; --$) n.splice.call(n, h[$], 1);
      return c;
    })(s.children);
  }
  return {
    eval: function (o) {
      (e = []), (t = []), (s = new Date().getTime());
      var a = p(
        (function (t) {
          var s,
            o = r.regLevel,
            a = r.invalidLine,
            i = t.split("\n"),
            p = 0,
            c = 0,
            u = [],
            l = new n(-1),
            f = new n(0);
          l.addChild(f);
          var d = [],
            h = "";
          u.push(f), d.push(p);
          for (var m = 0, $ = i.length; m < $; ++m)
            if (!(h = i[m]).match(a)) {
              if ((p = (s = o.exec(h)) ? s[1].length : 0) > c) {
                var g = f;
                (f = new n(p)), g.addChild(f), u.push(f), d.push(p);
              } else if (p < c) {
                for (var y = !1, w = d.length - 1; w >= 0; --w)
                  if (d[w] == p) {
                    (f = new n(p)),
                      u.push(f),
                      d.push(p),
                      null != u[w].parent && u[w].parent.addChild(f),
                      (y = !0);
                    break;
                  }
                if (!y)
                  return void e.push(
                    "Error: Invalid indentation at line " + m + ": " + h
                  );
              }
              f.lines.push(h.replace(r.trim, "")), (c = p);
            }
          return l;
        })(
          (function (e) {
            var t,
              s = e.split("\n"),
              n = r.comment;
            for (var o in s)
              (t = "string" == typeof s[o] && s[o].match(n)) &&
                void 0 !== t[3] &&
                (s[o] = t[0].substr(0, t[0].length - t[3].length));
            return s.join("\n");
          })(o)
        )
      );
      return (s = new Date().getTime() - s), a;
    },
    getErrors: function () {
      return e;
    },
    getProcessingTime: function () {
      return s;
    },
  };
})();
