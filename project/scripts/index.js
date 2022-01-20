function showCurrentPageAndHidePreviousPages(buttonForEvent, page1X, page2X, page3X, page4X) {
    buttonForEvent.addEventListener("click", () => {
        page1X.style.display = "block";
        page2X.style.display = "none";
        page3X.style.display = "none";
        page4X.style.display = "none";
    });
};
showCurrentPageAndHidePreviousPages(loginButton, loginFormWrapper, signUpFormWrapper, surveyList, graphSurveyWindow);
showCurrentPageAndHidePreviousPages(signUpButton, signUpFormWrapper, loginFormWrapper, surveyList, graphSurveyWindow);
showCurrentPageAndHidePreviousPages(surveyButton, surveyList, signUpFormWrapper, loginFormWrapper, graphSurveyWindow);
showCurrentPageAndHidePreviousPages(surveyGraphButton, graphSurveyWindow, surveyList, signUpFormWrapper, loginFormWrapper);

frameworksList.addEventListener("change", function () {
    page0.style.display = "none";
    page1.style.display = "block";
});

function createQuestionnaire(frameworks, pages) {
    let optionSelect = '<div><select id="frameworkChoice" name="Framework" required><option value="">Select framework</option>'
    frameworks.map(x => {
        optionSelect += `<option value="${x}" name="Framework">${x}</option>`;
    }).join("");
    pageFrameworkQuestions.innerHTML += optionSelect + "</select></div>";

    pageFrameworkQuestions.innerHTML += pages["Self Description"].map(x => {
        return `<div><input type="radio" value="${x}" name="SelfDescription" required><label for="${x}">${x}</label></div>`;
    }).join("");

    pageFrameworkQuestions.innerHTML += pages["Overall Performance"].map(x => {
        let questionToScale = `<div><label for="${x}">${x}</label>`;
        for (let i = 1; i <= 10; i++) {
            questionToScale += `<label for="${x}">${i}</label><input type="radio" value="${i}" name="${x}" required>`
            if (i == 10) {
                questionToScale += "<br>"
            }
        }
        return questionToScale + "</div>";
    }).join("");
}


let setupUI = (user) => {
    if (user) {
        navBarWhenUserLoggedInElements.forEach(navLink => navLink.style.display = "inline-block");
        navBarWhenUserIsNotLoggedInElements.forEach(navLink => navLink.style.display = "none");
    } else {
        navBarWhenUserLoggedInElements.forEach(navLink => navLink.style.display = "none");
        navBarWhenUserIsNotLoggedInElements.forEach(navLink => navLink.style.display = "inline-block");
    }
}

let setupGuides = (data) => {
    if (data.length) {
        data.forEach(doc => {
            const questionnaire = doc.data();
            let frameworkOptions = Object.keys(questionnaire);
            frameworksList.innerHTML += frameworkOptions.map(x => {
                return `<option value="${x}">${x}</option>`;
            }).join("")
            let pageSource = JSON.parse(questionnaire["Web Development Frameworks"]);
            createQuestionnaire(pageSource.Frameworks, pageSource.surveyQuestionPages);
        })
    } else {
        surveyList.innerHTML = "<h1>Log in to see questionnaire</h1>";
    }
};

let setupGraph = (data) => {
    if (data.length) {
        let ctx = document.getElementById("myChart");
        db.collection("WebFrameworksStats").get().then(snapshot => {
            let graphObject = {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Percentage',
                        data: [],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {

                        yAxes: [{
                            ticks: {

                                min: 0,
                                max: 100,
                                callback: function (value) { return value + "%" }
                            },
                            scaleLabel: {
                                display: true,
                                labelString: "Percentage"
                            }
                        }]
                    }
                }
            };

            snapshot.docs.forEach(element => {
                graphObject.data.labels.push(element.id);
                let counter = 0;

                for (let i in element.data()) {
                    let dataCountV1 = element.data()[i];
                    for (let j in dataCountV1) {
                        let dataCountV2 = element.data()[i][j];
                        for (let k in dataCountV2) {
                            if (!isNaN(Number(dataCountV2[k]))) {
                                switch (dataCountV2.SelfDescription) {
                                    case "Expert": counter += Number(dataCountV2[k]) * 5; break;
                                    case "Proficient": counter += Number(dataCountV2[k]) * 4; break;
                                    case "Competent": counter += Number(dataCountV2[k]) * 3; break;
                                    case "Advanced beginner": counter += Number(dataCountV2[k]) * 2; break;
                                    case "Novice": counter += Number(dataCountV2[k]); break;
                                }

                            }

                        }
                    }
                }
                // counter = Number("0." + counter) * 100;
                graphObject.data.datasets[0].data.push(counter);
            });
            let myChart = new Chart(ctx, graphObject);
        });
    } else {
        graphSurveyWindow.innerHTML = '<h1 style="text-align:center">Log in to see framework statistics</h1>';
    }
}