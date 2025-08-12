---
title: Notes on ForecastBench
slug: forecastbench
date: 2025-08-15T14:56:48+05:30
draft: true
toc:
  show: false
ShowRelatedContent: false
description: 'Notes from my review of the paper, "ForecastBench: A Dynamic Benchmark of AI Forecasting Capabilities."'
summary: ForecastBench continuously evaluates the performance of LLMs against an automatically generated, continuously updated set of forecasting questions.
tags:
  - ai
  - notes
  - research
categories:
  - AI
series: []
aliases: []
cover:
  image: /images/forecastbench/clouds-banner.jpg
  alt: Rain clouds.
  caption: TLDR; LLMs are no better than random human predictions. _For now_.
  relative: false
fmContentType: Post (default)
---

[ForecastBench](https://www.forecastbench.org) is a benchmark for measuring the accuracy of machine learning systems in forecasting questions. These are my notes from their paper titled "[ForecastBench: A Dynamic Benchmark of AI Forecasting Capabilities](https://arxiv.org/abs/2409.19839)."

Static evaluation methods using historical data from after a model's knowledge cutoff have drawbacks:

1. **Benchmarks can quickly become obsolete** as the knowledge cutoff gets updated on newer models.
2. **Knowledge cutoff dates** are more or less estimates and are **inaccurate**.
3. Model makers may **exaggerate their accuracy** on benchmarks.

Instead, ForecastBench uses a **dynamic benchmark that is updated daily as markets are resolved**, with new forecasting questions updated every two weeks. This is their data pipeline:

1. Create **1000 forecasting questions** sampled from a much bigger question bank.
2. The question bank contains questions from **multiple reliable prediction markets and datasets**:
   1. **Prediction markets**: [randforecastinginitiative.org](https://randforecastinginitiative.org), [manifold.markets](https://manifold.markets), [metacalculus.com](https://metacalculus.com), [polymarket.com](https://polymarket.com)
   2. **Datasets**: [ACLED](https://acleddata.com/), [DBnomics](https://db.nomics.world/), [FRED](https://fred.stlouisfed.org/), [Wikipedia](https://www.wikipedia.org/), [Yahoo Finance](https://finance.yahoo.com). Questions are created from these datasets using predefined templates.
3. These questions are **filtered and enhanced** before being added to the question bank:
   1. Removes low liquidity data.
   2. Adds more context to each question using a small LLM.
   3. Uses templates to add questions based on the datasets.
   4. Combines questions (NC2) to form more questions.
4. The actual questions are **sampled from the question bank every two weeks** and benchmarks are **run across multiple seven baselines**: **zero-shot prompting**, prompting **with scratchpad** instructions, prompting with scratchpad instructions and **retrieved news articles**, zero-shot prompting with **crowd forecasts**, scratchpad prompting with crowd forecasts, scratchpad prompting with retrieved news articles and crowd forecasts, aggregating predictions from multiple LLMs.
5. In addition to these LLM baselines, they also use **two human baselines**: 500 human forecasters, 39 "superforecasters". They use a **200-question random subset** of the questions.
6. The results are finalized using the **Brier score** as a metric. The current implementation utilizes a difficulty-adjusted Brier score to account for variability in question set difficulty.

The results show that **LLMs are only on par** (0.122) (or slightly worse) than the median human forecasters (0.121) and significantly worse than expert human superforecasters (0.096).

This suggests that there's a **lot of value to be gained** when someone develops an agent/model that can make more accurate forecasts, at least on a level comparable to that of the superforecasters.
