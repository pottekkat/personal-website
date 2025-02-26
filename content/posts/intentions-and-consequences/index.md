---
title: Intentions and Consequences
slug: intentions-and-consequences
date: 2025-02-25T08:45:02+05:30
draft: true
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
    relative: true
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
    margin: auto;
    padding: 14px;
    border: 1px solid var(--code-bg);
}

.dark #quiz-container {
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

.result:empty {
    margin-bottom: 0px !important;
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

#quiz-end {
    margin-top: 20px;
}
</style>

<div id="quiz-container"></div>

<!-- New paragraph to scroll to -->
<p id="quiz-end">
    Congratulations on completing the quiz! Reflect on the outcomes and think about how intentions and consequences play a role in policy-making.
</p>

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

                const questionText = document.createElement('p');
                questionText.innerText = item.question;
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

                const resultP = document.createElement('p');
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
                    let correctAnswer = questionDiv.getAttribute("data-correct");
                    let resultText = this.getAttribute("data-button") === correctAnswer ? "✅ Correct!" : this.getAttribute("data-message");
                    
                    questionDiv.querySelector(".result").innerText = resultText;
                    questionDiv.querySelector(".next").classList.remove("hidden");

                    // Disable all answer buttons and change their colors
                    questionDiv.querySelectorAll(".answer").forEach(btn => {
                        btn.disabled = true;
                        btn.classList.add('disabled');
                        if (btn.getAttribute("data-button") === correctAnswer) {
                            btn.classList.remove('disabled');
                        }
                    });
                });
            });

            document.querySelectorAll(".next").forEach(button => {
                button.addEventListener("click", function () {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < questions.length) {
                        showQuestion(currentQuestionIndex);
                    } else {
                        // Scroll to the new paragraph when the quiz is finished
                        document.getElementById('quiz-end').scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        });
});
</script>
{{< /rawhtml >}}