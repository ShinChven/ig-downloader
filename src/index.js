const puppeteer = require('puppeteer');
const fs = require('fs-extra');


const main = async () => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('https://www.instagram.com/shinchven/');
  await page.setViewport({
    width: 1200,
    height: 800
  });

  let data = [];
  page.on('response', response => {
    if (response.url().indexOf('query') > 0)
      response.json().then(result => {
        let edges = result.data.user.edge_owner_to_timeline_media.edges;
        edges.map(function (edge) {
          console.log(edge.node.display_url);
          data.push(edge.node.display_url);
        });
      })
  });
  await autoScroll(page);
  await fs.outputJson('data.json', data);

  await browser.close();
  return Promise.resolve();
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

main().then(() => {
  console.log('done')
});
