---
title: Calibration System
publishDate: 2026-11-01 00:00:00
img: /assets/case-study.jpg
img_alt: Calibration System
description: |
  Rebuilding a calibration lab's core system: from a decade-old Access database, to Power Apps, to a custom web app.
role: Designed the data model and interface, and building the system end to end.
techStack:
  - React
  - TypeScript
  - PostgreSQL
  - Resend
tags:
  - Systems Design
  - UX
  - Development

# Structured layout (see src/components/CaseStudyStory.astro).
# Images: add `heroImg:` / `heroImg_alt:` below for the big image under the
# intro, and `img:` / `img_alt:` to any phase or highlight. Nothing shows
# until an image is added.
story:
  eyebrow: Case study · In progress

  stats:
    - value: 10+
      label: years on the old system
    - value: "3"
      label: platforms, one system
    - value: ISO
      label: 17025 audit-ready records

  phasesEyebrow: The journey
  phasesHeading: Three versions, each fixing the last
  phases:
    - label: Before · Microsoft Access
      title: The legacy system
      body: >-
        An Access database that had run the lab for over ten years. Equipment
        was sorted by fixed text categories, and much of the logic depended on
        those exact strings.
    - label: Interim · Power Apps
      title: Into the cloud, fast
      body: >-
        A model-driven Power App got the data out of Access quickly. But
        screens had to follow the platform's layouts, and anything custom meant
        building complex PCF controls.
    - label: Now · Custom web app
      title: Built around the technicians
      current: true
      body: >-
        React and TypeScript on PostgreSQL. Full control over the interface, so
        screens follow how technicians actually work.

  highlightsHeading: What the rebuild made possible
  highlights:
    - title: Every reading checked, not the average
      visual: torque-chart
      body: >-
        Torque worksheets follow ISO 6789: each reading is checked against its
        permitted error, so one bad reading can't hide in a good average.
    - title: Categories as data, not text
      body: >-
        Around 20 text categories became proper types like Torque and
        Pressure. New equipment is now a data change, not a code change.
    - title: Email that doesn't depend on Microsoft
      body: >-
        Invites, resets and certificates send from the company's own verified
        domain, ready for a Microsoft Graph link-up later.

  next:
    - More worksheet types beyond torque
    - Two-way email with Microsoft Graph
    - Moving the rest off Power Apps
---
