import axios from "axios";

export async function POST(request) {
  const feishu = process.env.FEISHU;
  const team = process.env.TEAM;
  const project = process.env.PROJECT;

  const body = await request.json();
  let { state, id, name, title, commit_url, branch, error_message } = body;
  if (project) {
    const repo = commit_url.match(/([a-z-]+)\/commit/)?.[1];
    const id = commit_url.split("/").pop();
    commit_url = project + "/d/" + repo + "/git/commit/" + id;
  }
  let url;
  try {
    url = JSON.parse(feishu);
  } catch (e) {}

  if (!url) {
    return Response.json({ error: "feishu is not set" });
  }

  if (typeof url === "object") {
    url = url[name];
  }

  if (!url) {
    return Response.json({ error: "feishu is not match" });
  }

  title = title || "手动部署成功";
  let content = "😀 eufy | 代码发布成功";

  if (state === "error") {
    content = "😵 eufy | 代码发布失败";
    title = error_message;
  }

  if (branch === "release" || branch === "uat") {
    content = "🤖 eufy | 预发布" + (state === "error" ? "失败" : "成功");
  }

  if (!commit_url || state === "error") {
    commit_url = `https://app.netlify.com/teams/${team}/builds/${id}`;
  }

  await axios.post(url, {
    msg_type: "interactive",
    card: {
      elements: [
        {
          tag: "div",
          text: { content: title, tag: "lark_md" },
        },
        {
          actions: [
            {
              tag: "button",
              text: { content: "详情👀", tag: "lark_md" },
              url: commit_url,
              type: "default",
              value: {},
            },
          ],
          tag: "action",
        },
      ],
      header: {
        title: { content, tag: "plain_text" },
      },
    },
  });

  return Response.json({ success: true });
}
