const puppeteer = require("puppeteer");
const { saveTexts } = require("./db");

// Массив текстов
let data = [];

(async () => {
  // Инициализируем браузер, переходим на страницу
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://ctfnews.ru/", { waitUntil: "networkidle2" });

  //Кликаем на кнопку, ждем подгрузки страниц (делаем 2 раза)
  await page.click("#show_more");
  await page.waitForTimeout(500);

  await page.click("#show_more");
  await page.waitForTimeout(500);

  // Получаем ссылки на новости
  const newsLinks = await page.evaluate(() => {
    let items = Array.from(document.querySelectorAll(".one-news"));
    const LinkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    // Получаем строку ссылки из атрибута 'onclick'
    return items.map(
      (item) => item.getAttribute("onclick").match(LinkRegex)[0]
    );
  });

  // console.log(newsLinks)

  // Проходим по каждой странице
  for (const link of newsLinks) {
    await page.goto(link, { waitUntil: "networkidle2" });
    // получаем абзацы со страницы и выделяем текст
    const texts = await page.evaluate(() => {
      let nodes = Array.from(document.querySelectorAll(".news-page > p"));
      return nodes.map((node) => ({
        text: node.innerText,
        link: document.location.href,
      }));
    });
    data = data.concat(texts);
  }

  // фильтруем данные на пустые строки
  // так же стоит предусмотреть другие варианты фильтрации текстов
  data = data.filter((item) => item.text !== "");

  // сохраняем данные в БД
  await saveTexts(data);

  await browser.close();
})();
