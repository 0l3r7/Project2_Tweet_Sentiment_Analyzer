const tweetForm =
    document.getElementById("tweetForm");

const tweetText =
    document.getElementById("tweetText");

const characterCounter =
    document.getElementById("characterCounter");

const resultBox =
    document.getElementById("resultBox");

const analyzeButton =
    tweetForm.querySelector("button");


/* =========================
   PROFILE PICTURE
========================= */

const profilePicture =
    "/static/images/birdy.png";


/* =========================
   CHARACTER COUNTER
========================= */

tweetText.addEventListener(
    "input",
    function () {

        const characterCount =
            tweetText.value.length;

        characterCounter.textContent =
            `${characterCount} / 280`;

    }
);


/* =========================
   FORM SUBMISSION
========================= */

tweetForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const tweet =
            tweetText.value.trim();


        /* =========================
           EMPTY INPUT
        ========================= */

        if (tweet === "") {

            resultBox.style.display = "block";

            resultBox.className =
                "result-box error";

            resultBox.innerHTML = `

                <div class="tweet-header">

                    <img
                        src="${profilePicture}"
                        alt="Profile Picture"
                        class="tweet-avatar"
                    >

                    <div class="tweet-user">

                        <span class="tweet-name">
                            Sentiment Analyzer
                        </span>

                        <span class="tweet-handle">
                            @sentimentai
                        </span>

                    </div>

                </div>

                <div class="tweet-text">
                    Please enter a tweet.
                </div>

            `;

            return;
        }


        /* =========================
           SHOW RESULT AREA
        ========================= */

        resultBox.style.display = "block";


        /* =========================
           DISABLE BUTTON
        ========================= */

        analyzeButton.disabled = true;

        analyzeButton.textContent =
            "Analyzing...";


        /* =========================
           LOADING
        ========================= */

        resultBox.className =
            "result-box";

        resultBox.innerHTML = `

            <div class="tweet-header">

                <img
                    src="${profilePicture}"
                    alt="Profile Picture"
                    class="tweet-avatar"
                >

                <div class="tweet-user">

                    <span class="tweet-name">
                        Sentiment Analyzer
                    </span>

                    <span class="tweet-handle">
                        @sentimentai
                    </span>

                </div>

            </div>

            <div class="tweet-text">
                Analyzing your tweet...
            </div>

        `;


        try {

            /* =========================
               SEND TO FLASK
            ========================= */

            const response =
                await fetch("/predict", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        tweet: tweet
                    })

                });


            /* =========================
               READ RESPONSE
            ========================= */

            const data =
                await response.json();


            /* =========================
               CHECK RESPONSE
            ========================= */

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Prediction failed."
                );

            }


            /* =========================
               GET SENTIMENT
            ========================= */

            const sentiment =
                String(data.sentiment)
                    .toLowerCase();


            /* =========================
               RESULT HTML
            ========================= */

            resultBox.className =
                `result-box ${sentiment}`;


            resultBox.innerHTML = `

                <!-- PROFILE -->

                <div class="tweet-header">

                    <img
                        src="${profilePicture}"
                        alt="Profile Picture"
                        class="tweet-avatar"
                    >

                    <div class="tweet-user">

                        <span class="tweet-name">
                            Sentiment Analyzer
                        </span>

                        <span class="tweet-handle">
                            @sentimentai
                        </span>

                    </div>

                </div>


                <!-- USER TWEET -->

                <div class="tweet-text"></div>


                <!-- SENTIMENT -->

                <div
                    class="sentiment-label ${sentiment}"
                >
                    ${escapeHTML(data.sentiment)}
                </div>


                <!-- GEMINI EXPLANATION -->

                <div class="ai-explanation">

                    <strong>
                        Gemini explanation
                    </strong>

                    <span class="explanation-text">
                    </span>

                </div>

            `;


            /* =========================
               INSERT TWEET SAFELY
            ========================= */

            const displayedTweet =
                resultBox.querySelector(
                    ".tweet-text"
                );

            displayedTweet.textContent =
                tweet;


            /* =========================
               INSERT EXPLANATION SAFELY
            ========================= */

            const explanationText =
                resultBox.querySelector(
                    ".explanation-text"
                );

            explanationText.textContent =
                data.explanation ||
                "No explanation available.";


            /* =========================
               TRANSLATION
            ========================= */

            if (
                data.translation_applied &&
                data.translated_tweet
            ) {

                const translation =
                    document.createElement("div");

                translation.style.marginTop =
                    "10px";

                translation.textContent =
                    `English translation: ${data.translated_tweet}`;

                resultBox
                    .querySelector(
                        ".ai-explanation"
                    )
                    .appendChild(
                        translation
                    );

            }


        } catch (error) {

            /* =========================
               ERROR RESULT
            ========================= */

            resultBox.style.display =
                "block";

            resultBox.className =
                "result-box error";


            resultBox.innerHTML = `

                <div class="tweet-header">

                    <img
                        src="${profilePicture}"
                        alt="Profile Picture"
                        class="tweet-avatar"
                    >

                    <div class="tweet-user">

                        <span class="tweet-name">
                            Sentiment Analyzer
                        </span>

                        <span class="tweet-handle">
                            @sentimentai
                        </span>

                    </div>

                </div>

                <div class="tweet-text"></div>

            `;


            const errorText =
                resultBox.querySelector(
                    ".tweet-text"
                );

            errorText.textContent =
                error.message;


        } finally {

            /* =========================
               ENABLE BUTTON
            ========================= */

            analyzeButton.disabled =
                false;

            analyzeButton.textContent =
                "Post";

        }

    }
);


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}