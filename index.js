const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const xlsx = require("xlsx");

async function getSiteData(){
    const response = await axios({
        method: "get",
        url : "https://www.quikr.com/jobs/quicker-job-in-hyderabad+hyderabad+zwqxj4157493934",
        headers:{
            "content-type" : 'text/html'
        }
    })

    fs.writeFileSync("webScrappedData.txt",response.data);
}

// getSiteData();

const jobData = [];

const htmlDataFromFile = fs.readFileSync("webScrappedData.txt",{encoding:"utf-8"});

const $ = cheerio.load(htmlDataFromFile);

const jobsList = $(".jsListItems").find(".job-card").each((index,elem)=>{
    const jobTitle = $(elem).find(".job-title").text();
    const jobDetailsDiv = $(elem).find(".salaryNjobtype ").children()
    const salary = $(jobDetailsDiv[0]).find(".perposelSalary ").text();
    const jobType = $(jobDetailsDiv[1]).find(".attributeVal").text();
    const company = $(jobDetailsDiv[2]).find(".attributeVal").text();
    const experienceDivChildren = $(jobDetailsDiv[3]).find(".lineH ").children();
    const experience = experienceDivChildren.length > 0 && $(experienceDivChildren[1]).text();
    const jobPostedOn = $(elem).find(".jsPostedOn").text();

    if(jobTitle.length> 0){
        const jobDetails = {
            "Job Title":jobTitle,
            "Salary":salary,
            "Job Type":jobType,
            "Company":company,
            "Experience":experience,
            "Job Posted On":jobPostedOn
        }
        jobData.push(jobDetails);
    }
});

const workBook = xlsx.utils.book_new();
const workSheet = xlsx.utils.json_to_sheet(jobData);

xlsx.utils.book_append_sheet(workBook,workSheet,"Sheet1");
xlsx.writeFile(workBook,"jobDetails.xlsx");