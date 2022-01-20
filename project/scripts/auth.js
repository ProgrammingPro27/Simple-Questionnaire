let signupForm = document.getElementById("form");
let loginForm = document.getElementById("form2");
let surveyList = document.getElementById("frameworks");
let logoutButton = document.getElementById("logoutBtn");
let signUpButton = document.getElementById("signUpBtn");
let loginButton = document.getElementById("loginBtn");
let surveyButton = document.getElementById("surveyList");
let surveyGraphButton = document.getElementById("surveyGraphBtn");
let signUpFormWrapper = document.getElementById("signUpForm");
let loginFormWrapper = document.getElementById("loginForm");
let frameworksList = document.getElementById('frameworksList');
let graphSurveyWindow = document.getElementById('surveyGraph');
let page0 = document.getElementById('p1');
let page1 = document.getElementById('p2');
let pageFrameworkQuestions = document.getElementById("frameworkTechnologyQuestions");
let buttonToPageSelfDescription = document.getElementById("buttonToPageSelfDescription");
let navBarWhenUserLoggedInElements = [].slice.call(document.getElementsByClassName("logged-In"));
let navBarWhenUserIsNotLoggedInElements = [].slice.call(document.getElementsByClassName("logged-Out"));

auth.onAuthStateChanged(user => {
    if (user) {
        db.collection("survey").get().then(snapshot => {
            setupGuides(snapshot.docs);
            setupUI(user);
        });
        db.collection("WebFrameworksStats").get().then(snapshot => {
            setupGraph(snapshot.docs)
        });
    } else {
        console.log("User logged out");
        setupUI();
        setupGuides([]);
        setupGraph([]);
    }
});

signupForm.addEventListener("submit", (e) => {
    e.preventDefault()
    let userEmail = document.getElementById("mailField").value;
    let userPassword = document.getElementById("passField").value;
    auth.createUserWithEmailAndPassword(userEmail, userPassword).then(x=>{
        location.reload()
    });

});

logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    auth.signOut();
});

loginForm.addEventListener("submit", (e) => {
    e.preventDefault()
    let userEmail = document.getElementById("mailField2").value;
    let userPassword = document.getElementById("passField2").value;
    auth.signInWithEmailAndPassword(userEmail, userPassword).then(x => { location.reload() });
});

function getAnsweredQuestions() {
    let userAnswers = {};
    const formData = new FormData(pageFrameworkQuestions);
    for (let pair of formData.entries()) {
        if (pair[1] && pair[1] !== "") {
            userAnswers[pair[0]] = pair[1];
        } else {
            alert("Invalid input, please check if every field is filled!");
            return;
        }
    }
    return userAnswers;
}

pageFrameworkQuestions.addEventListener("submit", (e) => {
    e.preventDefault();
    let frameworkChoice = document.getElementById("frameworkChoice");
    let currentlyLoggedUser = auth.currentUser.email;
    let questionnaireAnswers = getAnsweredQuestions();
    if (questionnaireAnswers) {
        db.collection("WebFrameworksStats").doc(frameworkChoice.value).update({
            [currentlyLoggedUser]: questionnaireAnswers
        }).then(x => { location.reload() });
    }

})