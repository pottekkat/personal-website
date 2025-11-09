---
title: Intentions and Consequences
slug: intentions-and-consequences
date: 2025-03-03T08:45:02+05:30
readingTime: 5
draft: false
toc:
    show: false
ShowRelatedContent: false
description: The road to hell is paved with good intentions.
summary: An interactive quiz to teach the importance of evaluating actions by their consequences and not their intentions.
tags:
    - government
    - public policy
    - interactive
categories:
    - Public Policy
series: []
aliases: []
cover:
    image: /images/intentions-and-consequences/red-sandalwood-banner.jpg
    alt: Red Sandalwood Tree.
    caption: The virtue of a doer itself does not guarantee good outcomes - The Nitopadesha
    relative: false
fmContentType: Post (default)
---

You probably have a good sense of what makes a policy work.

After all, any policy would either help people, make things worse, or do nothing at all. Policymakers just have to pick the ones that help and avoid the ones that cause problems. _Easy. Aasaan. Nissaaram!_

But how well can you _actually_ tell the difference?

Below is a small exercise. For each of these real policy interventions, your job is to decide whether it had a positive, negative, or neutral outcome.

Let's see if your instincts match reality.

{{< rawhtml >}}
<style>
#quiz-container {
    width: 100%;
    margin: 40px auto;
    padding: 14px;
    border: 1px solid var(--code-bg);
    background-color: var(--hljs-bg);
}

.question {
    display: none;
}

.question.active {
    display: block;
}

.question button {
    display: block;
    width: 100%;
    border-radius: var(--radius);
    background: var(--code-bg);
    border: 1px solid var(--border);
    padding-inline-start: 14px;
    padding-inline-end: 14px;
    color: var(--secondary);
    font-size: 14px;
    line-height: 34px;
}

.bottom-margin {
    margin-bottom: 10px
}

.question button:hover {
    background: var(--border);
}

.question .hidden {
    display: none;
}

.result:not(:empty) {
    margin-top: 20px;
}

.question .next {
    background: var(--primary);
    color: var(--code-bg);
}

.question .next:hover {
    background: var(--secondary);
}

.question button.disabled {
    background: var(--border);
    cursor: not-allowed;
    text-decoration: line-through;
}

.question .question-title {
    font-size: 14px;
    color: var(--secondary);
}

#quiz-end {
    display: none;
    margin-top: 20px;
}

#placeholder {
    margin-top: 20px;
}
</style>

<div id="quiz-container"></div>

<p id="placeholder"><strong>Complete the exercise</strong> to continue.</p>

<div id="quiz-end">
    <p>How was the quiz? What did you notice about the outcomes of these policies? Were you able to <em>accurately</em> pick the good policies from the bad?</p>

    <p>All these policies had good intentions. <em>No doubt</em>. But if good intentions were enough, <em>every</em> policy intervention made by the government would be a success, unlike the glaring examples we saw before.</p>

    <p>Most people, including policymakers, tend to make this mistake and evaluate policies by their intentions rather than their track record, even though history is littered with well-meaning policies that backfired spectacularly.</p>

    <p>They forget that policies don't operate in a vacuum. Instead policies interact with markets and society, often leading to consequences nobody anticipated.</p>

    <p>If we don’t train ourselves to think in terms of consequences rather than intentions, we risk endorsing policies that sound good but make problems worse. As the wise crow from <em>The Nitopadesha</em> says:</p>

    <blockquote><p>… in all matters of public interest, one must judge things from the calculation of consequences.</p><footer><strong></strong>
    <cite><a target="_blank" href="/posts/the-jewel-of-citizencraft/" title="/posts/the-jewel-of-citizencraft/">The Monkey and the Fearsome Four-Eyed Dogs, The Nitopadesha</a></cite></footer></blockquote>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
    fetch('quiz-data.json')
        .then(response => response.json())
        .then(data => {
            const quizContainer = document.getElementById('quiz-container');
            data.forEach((item, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.classList.add('question');
                if (index === 0) questionDiv.classList.add('active');

                questionDiv.setAttribute('data-correct', item.correct);

                const questionTitle = document.createElement('p');
                questionTitle.innerText = item.title;
                questionTitle.classList.add('question-title')
                questionDiv.appendChild(questionTitle);

                const questionText = document.createElement('p');
                questionText.innerHTML = item.question;
                questionDiv.appendChild(questionText);

                item.answers.forEach((answer, answerIndex) => {
                    const answerButton = document.createElement('button');
                    answerButton.classList.add('answer');
                    if (answerIndex !== item.answers.length - 1) {
                        answerButton.classList.add('bottom-margin');
                    }
                    answerButton.setAttribute('data-button', answer.value);
                    answerButton.setAttribute('data-message', answer.message);
                    answerButton.innerHTML = `<strong>${answer.option}</strong>: ${answer.text}`;
                    questionDiv.appendChild(answerButton);
                });

                const resultP = document.createElement('div');
                resultP.classList.add('result');
                questionDiv.appendChild(resultP);

                const nextButton = document.createElement('button');
                nextButton.classList.add('next', 'hidden');
                nextButton.innerText = index === data.length - 1 ? 'Finish' : 'Next';
                questionDiv.appendChild(nextButton);

                quizContainer.appendChild(questionDiv);
            });

            const questions = document.querySelectorAll(".question");
            let currentQuestionIndex = 0;

            function showQuestion(index) {
                questions.forEach((q, i) => {
                    q.classList.remove("active");
                    if (i === index) q.classList.add("active");
                });
            }

            document.querySelectorAll(".answer").forEach(button => {
                button.addEventListener("click", function () {
                    let questionDiv = this.closest(".question");
                    let resultText = this.getAttribute("data-message");
                    
                    questionDiv.querySelector(".result").innerHTML = resultText;
                    questionDiv.querySelector(".next").classList.remove("hidden");

                    // Disable all answer buttons and change their colors
                    questionDiv.querySelectorAll(".answer").forEach(btn => {
                        btn.disabled = true;
                        btn.classList.add('disabled');
                        if (btn.getAttribute("data-button") === questionDiv.getAttribute("data-correct")) {
                            btn.classList.remove('disabled');
                            btn.innerHTML = `✅ ${btn.innerHTML}`;
                        }
                    });
                });
            });

            document.querySelectorAll(".next").forEach(button => {
                button.addEventListener("click", function () {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < questions.length) {
                        showQuestion(currentQuestionIndex);

                        // Scroll to the start of the quiz container when the next button is clicked
                        const quizContainer = document.getElementById('quiz-container');
                        const offset = 50; // Adjust this value to leave space from the top
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = quizContainer.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    } else {
                        // Show the quiz-end div and hide the placeholder when the quiz is finished
                        document.getElementById('quiz-end').style.display = 'block';
                        document.getElementById('placeholder').style.display = 'none';

                        // Remove this if there are problems on mobile
                        // Scroll to the new paragraph when the quiz is finished
                        const quizEnd = document.getElementById('quiz-end');
                        const offset = 50; // Adjust this value to leave space from the top
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = quizEnd.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });
});
</script>
{{< /rawhtml >}}
