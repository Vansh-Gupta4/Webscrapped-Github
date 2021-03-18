//multi level activity
const request = require("request"); //now we can use properties of request
const cheerio = require("cheerio"); //now we can use properties of cheerio
let fs = require("fs");
let $;
let data = {};
const { jsPDF } = require("jspdf");

function linkGenerator(error, response, body) {
  if (!error && response.statusCode == 200) {
    $ = cheerio.load(body);

    let alltopics = $(".no-underline.d-flex.flex-column.flex-justify-center"); //links milti h topics ki
    let allTopicNames = $(
      ".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1"
    ); //topic ka naam milta h isse
    for (let x = 0; x < 3; x++) {
      getTopicPage(
        $(allTopicNames[x]).text().trim(), //trim function removes unnecessary spaces
        "https://github.com/" + $(alltopics[x]).attr("href") //humne alltopics ko $ se wrap kiya kyuki alltopics array bann gya tha ...isse voh wapas cheerio ka object bann jayega
      );
    }
  }
}

function getTopicPage(name, url) {
  //give topic's project's name and their links
  request(url, function (error, res, body) {
    if (!error && res.statusCode == 200) {
      $ = cheerio.load(body);
      let allProjects = $(
        ".f3.color-text-secondary.text-normal.lh-condensed .text-bold"
      ); //isse project ke anchor tags mil gaye

      if (allProjects.length > 8) {
        //kyuki humme 8 hi projects chaiye thai
        allProjects = allProjects.slice(0, 8);
      }

      for (let x = 0; x < allProjects.length; x++) {
        let projectTitle = $(allProjects[x]).text().trim(); //project ka naam
        let projectLink =
          "https://github.com/" + $(allProjects[x]).attr("href"); //project ka link
        if (!data[name]) {
          data[name] = [{ name: projectTitle, link: projectLink }];
        } else {
          data[name].push({ name: projectTitle, link: projectLink });
        }

        getIssuesPage(projectTitle, name, projectLink + "/issues");
      }
    }
  });
}

function getIssuesPage(projectName, topicName, url) {
  request(url, function (error, res, body) {
    if (!error && res.statusCode == 200) {
      $ = cheerio.load(body);

      let allIssues = $(
        ".Link--primary.v-align-middle.no-underline.h4.js-navigation-open"
      ); //issue ke anchor tags deta h

      for (let x = 0; x < allIssues.length; x++) {
        let issueURL = "https://github.com/" + $(allIssues[x]).attr("href"); //issue ka link
        let issueTitle = $(allIssues[x]).text().trim(); //issue ka naam

        let index = -1;
        for (let i = 0; i < data[topicName].length; i++) {
          if (data[topicName][i].name === projectName) {
            index = i;
            break;
          }
        }

        if (!data[topicName][index].issues) {
          data[topicName][index].issues = [{ issueTitle, issueURL }];
        } else {
          data[topicName][index].issues.push({ issueTitle, issueURL });
        }
      }
      fs.writeFileSync("data.json", JSON.stringify(data));
      pdfGenerator(data);
    }
  });
}

request("https://github.com/topics", linkGenerator); //call back function


function pdfGenerator(d) {
  for (x in d) {
    if (!fs.existsSync(x)) fs.mkdirSync(x);   //folder bana diya
    let path = "./" + x + "/";
    for (y in d[x]) {
      const doc = new jsPDF();
      let issueArr = d[x][y].issues;
      let spacing = 1;
      for (z in issueArr) {
        doc.text(issueArr[z].issueTitle, 10, 10 * spacing); //these nos. are margin left and top respectively
        doc.text(issueArr[z].issueURL, 10, 10 * spacing + 5);
        spacing++;
      }
      if (fs.existsSync(path + d[x][y].name + ".pdf"))
        fs.unlinkSync(path + d[x][y].name + ".pdf");
      doc.save(path + d[x][y].name + ".pdf");
    }
  }
}
