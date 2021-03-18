let fs = require("fs");
const { jsPDF } = require("jspdf");

let d = {
  "c++": [
    {
      name: "abc",
      link: "abc.com",
      issue: [{ issueName: "name", issueUrl: "link" },
      { issueName: "name2", issueUrl: "link2" }],
    },
  ],
  
};

function pdfGenerator(d) {
  for (x in d) {
    fs.mkdirSync(x); //folder bana diya
    let path = "./" + x + "/";
    for (y in d[x]) {
      const doc = new jsPDF();
      let issueArr = d[x][y].issue;
      let spacing = 1;
      for (z in issueArr) {
        doc.text(issueArr[z].issueName, 10, 10 * spacing); //these nos. are margin left and top respectively
        doc.text(issueArr[z].issueUrl, 10, 10 * spacing + 5);
        spacing++;
      }
      doc.save(path + d[x][y].name + ".pdf");
    }

   
  }
}
pdfGenerator(d);
