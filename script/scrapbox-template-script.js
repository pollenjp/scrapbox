import { CustomDate } from "/api/code/pollenJP-MEMO/scrapbox-script-date/script.js";

export function addTemplateItemsToPageMenu(project_name) {
  // テンプレートメニューの定義ここから ---------- 下の解説を見てね！！ ----------
  const __templates = [
    {
      title: "Daily Report Template",
      template: `/api/code/${project_name}/DailyReportTemplate/DailyReportTemplate.js`,
    },
    {
      title: "Gallery Template",
      template: `/api/code/${project_name}/GalleryTemplate/Template.js`,
    },
    {
      title: "Gallery - UnrealEngine",
      template: `/api/code/${project_name}/UnrealEngineGalleryTemplate/Template.js`,
    },
    {
      title: "Gallery - GLSL",
      template: `/api/code/${project_name}/GLSLGalleryTemplate/Template.js`,
    },
    {
      title: "Gallery - DeepLearning",
      template: `/api/code/${project_name}/DeepLearningGalleyTemplate/Template.js`,
    },
    {
      title: "Discord Bot Portal JP Log",
      template: `/api/code/${project_name}/DiscordBotPortalJPLogTemplate/script.js`,
    },
    {
      title: "Q&A Log",
      template: `/api/code/${project_name}/scrapbox-template_q-and-a-log/script.js`,
    },
    {
      title: "Person",
      template: `/api/code/${project_name}/scrapbox-template_scrap-person/script.js`,
    },
    {
      title: "Book",
      template: `/api/code/${project_name}/scrapbox-template_scrap-book/script.js`,
    },
    {
      title: "論文",
      template: `/api/code/${project_name}/scrapbox-template_scrap-thesis/script.js`,
    },
  ];
  // テンプレートメニューの定義ここまで ----------

  const __templMenuTitle = "Templates";
  scrapbox.PageMenu.addMenu({
    title: __templMenuTitle,
    image: "https://i.gyazo.com/a7bab496975e8cc88e3f957fdd34c900.png",
    onClick: () => {},
  });
  __templates.forEach((i) => {
    scrapbox.PageMenu(__templMenuTitle).addItem({
      title: i.title,
      onClick: () => {
        __loadTemplate(i.template);
      },
    });
  });
  var __loadTemplate = function (templateUrl) {
    if (scrapbox.Page.lines && scrapbox.Page.lines.length == 1) {
      // タイトル行をクリックしたことにする
      const line = document.getElementById("L" + scrapbox.Page.lines[0].id);
      const lastChar = line.querySelector("span.char-index:last-of-type");
      const textarea = document.getElementById("text-input");
      lastChar.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true })
      );
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          keyCode: 35,
        })
      );

      // テンプレートを読み込む
      $("#text-input").load(templateUrl, function (response, status, xhr) {
        console.log("helloooooooooooooo");
        if (status == "success") {
          try {
            // 読み込んだテンプレートをテキストエリアにセットしまして
            const textarea = document.getElementById("text-input");
            textarea.value = /\.js$/.test(templateUrl)
              ? eval(response)
              : response;

            // テキストエリアのinputイベントを出しまして
            textarea.dispatchEvent(
              new InputEvent("input", { bubbles: true, cancelable: true })
            );
          } catch (ex) {
            console.log("だめでした>< \n" + ex);
          }
        } else {
          console.log("だめでした>< \n" + status);
        }
      });
    } else {
      console.log("新しいページで試してね\n" + scrapbox.Page.lines.length);
      console.log(scrapbox.Page.lines);
    }
  };
}

addTemplateItemsToPageMenu(/* project_name= */ "pollenJP-Memo");
